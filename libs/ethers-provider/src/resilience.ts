import {
  retry,
  circuitBreaker,
  wrap,
  handleWhen,
  ExponentialBackoff,
  ConsecutiveBreaker,
} from 'cockatiel';
import { log } from '@thecointech/logging';


function intFromEnv(name: string, def: number, { min, max }: { min?: number; max?: number } = {}) {
  const raw = process.env[name];
  const n = Number.isFinite(Number(raw)) ? Number(raw) : def;
  return Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n));
}

// Ethereum RPC retry policy - more aggressive than GAE due to network volatility
export const ethRpcRetryPolicy = retry(handleWhen(isRetriableEthError), {
  maxAttempts: intFromEnv("RESILIENCE_MAX_ATTEMPTS", 5, { min: 1 }),
  backoff: new ExponentialBackoff({
    initialDelay: intFromEnv("RESILIENCE_INITIAL_DELAY", 1000, { min: 100 }),    // Start with 1s
    maxDelay: intFromEnv("RESILIENCE_MAX_DELAY", 30000, { min: 1000 }),           // Max 30s
    exponent: 2
  }),
});

// Circuit breaker for Ethereum RPC calls
export const ethRpcCircuitBreaker = circuitBreaker(handleWhen(isRetriableEthError), {
  halfOpenAfter: intFromEnv("RESILIENCE_CIRCUIT_HALF_OPEN_AFTER", 30000, { min: 1000 }),  // Try again after 30s
  breaker: new ConsecutiveBreaker(intFromEnv("RESILIENCE_CIRCUIT_BREAK_AFTER", 10, { min: 1 })), // Break after 10 consecutive failures
});

// Combined policy for Ethereum RPC calls
export const ethRpcPolicy = wrap(
  ethRpcCircuitBreaker,
  ethRpcRetryPolicy,
);

// Add event logging to individual policies
ethRpcRetryPolicy.onRetry(({ attempt, delay }) => {
  log.warn(`Retrying Ethereum RPC call (attempt ${attempt}) after ${delay}ms delay`);
});

ethRpcRetryPolicy.onGiveUp(failure => {
  log.error(failure, "Ethereum RPC retry policy exceeded");
});

ethRpcCircuitBreaker.onBreak(failure => {
  log.error(failure, 'Ethereum RPC circuit breaker opened - provider appears down');
});

ethRpcCircuitBreaker.onReset(() => {
  log.info('Ethereum RPC circuit breaker reset - provider recovered');
});

const retriableCodes = new Set([
  'NETWORK_ERROR','SERVER_ERROR','TIMEOUT','ECONNRESET','ECONNREFUSED','ETIMEDOUT','EHOSTUNREACH','429','RATE_LIMITED',
]);

function isRetriableEthError(err: unknown): boolean {
  const code = (err as any)?.code ?? (err as any)?.statusCode ?? (err as any)?.status;
  if (typeof code === 'number') return code === 429 || code >= 500;
  if (typeof code === 'string') return retriableCodes.has(code.toUpperCase());
  const msg = String((err as any)?.message ?? '').toUpperCase();
  return ['NETWORK','TIMEOUT','CONN','EHOSTUNREACH','RATE LIMIT'].some(k => msg.includes(k));
}

/**
 * Creates a proxy that automatically wraps Ethereum provider method calls with resilience policies
 */
const nonRpcMethods = new Set<string>([
  // event methods (must be sync + chainable)
  'on','off','once','emit','addListener','removeListener','removeAllListeners',
  'prependListener','prependOnceListener',
  // connection/lifecycle helpers
  'destroy','pause','resume','constructor',
  // promise-ish traps
  'then','catch','finally',
]);
export function createEthProviderProxy<T extends object>(target: T): T {
  const cache = new Map<PropertyKey, Function>();
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const originalValue = Reflect.get(obj, prop, receiver);
      if (typeof originalValue !== 'function') {
        return originalValue;
      }
      if (typeof prop === 'symbol') return originalValue;
      if (typeof prop === 'string' && (prop.startsWith('_') || nonRpcMethods.has(prop))) {
        return originalValue;
      }
      const cached = cache.get(prop);
      if (cached) return cached;

      // Only wrap functions
      const wrapped = function (this: unknown, ...args: unknown[]) {
        // Wrap the function execution with resilience policy
        // Cockatiel will handle whether the result is a promise or not
        return ethRpcPolicy.execute(
          () => originalValue.apply(obj, args),
        );
      };
      cache.set(prop, wrapped);
      return wrapped;
    },
    set(obj, prop, value, receiver) {
      // Clear cache when property is assigned
      cache.delete(prop);
      return Reflect.set(obj, prop, value, receiver);
    },
  });
}

// export function createEthProviderProxy<T extends object>(target: T): T {
//   return new Proxy(target, {
//     get(target, prop, receiver) {
//       const originalValue = Reflect.get(target, prop, receiver);

//       // Wrap all functions except those explicitly blacklisted
//       if (typeof originalValue === 'function' && !isNonRpcMethod(prop)) {
//         return function(this: any, ...args: any[]) {
//           // Wrap the function execution with resilience policy
//           return ethRpcPolicy.execute(() => originalValue.apply(this, args));
//         };
//       }

//       // For non-RPC methods, return as-is
//       return originalValue;
//     }
//   });
// }

// /**
//  * Determines if a method should NOT be wrapped with resilience (blacklist approach)
//  */
// function isNonRpcMethod(prop: string | symbol): boolean {
//   if (typeof prop === 'symbol') {
//     return true; // Don't wrap symbol methods
//   }

//   const nonRpcMethods = [
//     // Constructor and prototype methods
//     'constructor',

//     // Property getters (not RPC calls)
//     'projectId', 'apiKey', 'network', 'formatter', '_network',

//     // Utility/helper methods (synchronous operations)
//     'format', 'parse', '_format', '_parse',
//     'isCommunityResource', 'detectNetwork',

//     // Event-related (local operations)
//     'on', 'off', 'emit', 'removeListener', 'removeAllListeners',
//     'addListener', 'once', 'prependListener', 'prependOnceListener',

//     // Internal state methods (synchronous)
//     '_ready', '_start', '_waitUntilReady', 'ready',

//     // Caching/local operations
//     '_cache', '_clearCache',

//     // Connection management (handled by underlying transport)
//     'destroy', 'pause', 'resume'
//   ];

//   return nonRpcMethods.includes(prop) ||
//          prop.startsWith('_') ||  // Private methods (usually internal/synchronous)
//          prop === 'then' ||       // Promise methods
//          prop === 'catch' ||
//          prop === 'finally';
// }
