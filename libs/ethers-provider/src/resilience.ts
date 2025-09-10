import {
  retry,
  circuitBreaker,
  wrap,
  handleAll,
  ExponentialBackoff,
  ConsecutiveBreaker
} from 'cockatiel';
import { log } from '@thecointech/logging';

// Ethereum RPC retry policy - more aggressive than GAE due to network volatility
export const ethRpcRetryPolicy = retry(handleAll, {
  maxAttempts: Number(process.env.ETH_RPC_MAX_ATTEMPTS ?? 5),
  backoff: new ExponentialBackoff({
    initialDelay: Number(process.env.ETH_RPC_INITIAL_DELAY ?? 1000),    // Start with 1s
    maxDelay: Number(process.env.ETH_RPC_MAX_DELAY ?? 30000),           // Max 30s
    exponent: 2
  })
});

// Circuit breaker for Ethereum RPC calls
export const ethRpcCircuitBreaker = circuitBreaker(handleAll, {
  halfOpenAfter: Number(process.env.ETH_RPC_HALF_OPEN_AFTER ?? 30000),  // Try again after 30s
  breaker: new ConsecutiveBreaker(Number(process.env.ETH_RPC_BREAKER_CONSECUTIVE ?? 10)) // Break after 10 consecutive failures
});

// Combined policy for Ethereum RPC calls
export const ethRpcPolicy = wrap(
  ethRpcCircuitBreaker,
  ethRpcRetryPolicy,
);

// Add event logging to individual policies
ethRpcRetryPolicy.onRetry(({ attempt, delay }: { attempt: number; delay: number }) => {
  log.warn(`Retrying Ethereum RPC call (attempt ${attempt}) after ${delay}ms delay`);
});

ethRpcCircuitBreaker.onBreak(() => {
  log.error('Ethereum RPC circuit breaker opened - provider appears down');
});

ethRpcCircuitBreaker.onReset(() => {
  log.info('Ethereum RPC circuit breaker reset - provider recovered');
});

/**
 * Creates a proxy that automatically wraps Ethereum provider method calls with resilience policies
 */
const blacklist: (string | symbol)[] = [];
export function createEthProviderProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const originalValue = Reflect.get(obj, prop, receiver);
      if (typeof originalValue !== 'function') {
        return originalValue;
      }
      if (blacklist.includes(prop)) {
        return originalValue;
      }
      // Only wrap functions
      return function (this: unknown, ...args: unknown[]) {
        // Wrap the function execution with resilience policy
        // Cockatiel will handle whether the result is a promise or not
        return ethRpcPolicy.execute(
          () => originalValue.apply(obj, args),
        );
      };
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
