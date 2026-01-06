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

const noRetryMethod = (prop: PropertyKey) => (
  typeof prop === 'symbol' || typeof prop === 'string' && (prop.startsWith('_') || nonRpcMethods.has(prop))
)

type PassThrough = (this: unknown, ...args: unknown[]) => unknown;
export function createEthProviderProxy<T extends object>(target: T): T {
  const cache = new Map<PropertyKey, PassThrough>();
  return new Proxy(target, {
    get(obj, prop, _receiver) {
      const originalValue = Reflect.get(obj, prop, target);
      if (typeof originalValue !== 'function') {
        return originalValue;
      }

      const cached = cache.get(prop);
      if (cached) return cached;

      const wrapped = newMethodInstance(originalValue, obj, prop);
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

const newMethodInstance = (originalValue: Function, obj: any, prop: PropertyKey): PassThrough => (
  (noRetryMethod(prop))
    // Bind the function to ensure that it is called with
    // the correct "this" context (ie, obj).  Otherwise calls
    // to #<method> will fail
    ? originalValue.bind(obj)
    // Wrap the function execution with resilience policy
    // Cockatiel will handle whether the result is a promise or not
    : function (this: unknown, ...args: unknown[]) {
      return ethRpcPolicy.execute(
        () => originalValue.apply(obj, args),
      );
    }
)
