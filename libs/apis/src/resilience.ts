// Possible TODO: Move this to it's own library later.

import {
  retry,
  circuitBreaker,
  wrap,
  handleAll,
  ExponentialBackoff,
  ConsecutiveBreaker
} from 'cockatiel';
import { log } from '@thecointech/logging';

// Base retry policy for API calls
export const apiRetryPolicy = retry(handleAll, {
  maxAttempts: Number(process.env.RESILIENCE_MAX_ATTEMPTS ?? 3),
  backoff: new ExponentialBackoff({
    initialDelay: Number(process.env.RESILIENCE_INITIAL_DELAY ?? 5000),    // Start with 5s
    maxDelay: Number(process.env.RESILIENCE_MAX_DELAY ?? 90000),       // Max 90s for GAE cold starts
    exponent: 2
  })
});

// Circuit breaker for GAE services
export const gaeCircuitBreaker = circuitBreaker(handleAll, {
  halfOpenAfter: Number(process.env.RESILIENCE_CIRCUIT_HALF_OPEN_AFTER ?? 60000),  // Try again after 1 minute
  breaker: new ConsecutiveBreaker(Number(process.env.RESILIENCE_CIRCUIT_BREAK_AFTER ?? 5)) // Break after 5 consecutive failures
});

// Combined policy for GAE API calls (no timeout - let axios handle it)
export const gaeApiPolicy = wrap(
  gaeCircuitBreaker,
  apiRetryPolicy
);

// Add event logging to individual policies
apiRetryPolicy.onRetry(({ attempt, delay }) => {
  log.warn(`Retrying GAE API (attempt ${attempt}) after ${delay}ms delay`);
});

apiRetryPolicy.onGiveUp(failure => {
  log.error(failure, "GAE API retry policy exceeded");
});

gaeCircuitBreaker.onBreak(failure => {
  log.error(failure, 'GAE API circuit breaker opened - service appears down');
});

gaeCircuitBreaker.onReset(() => {
  log.info('GAE API circuit breaker reset - service recovered');
});

/**
 * Creates a proxy that automatically wraps method calls with GAE resilience policies
 */
export function createGaeServiceProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const originalValue = Reflect.get(obj, prop, receiver);
      if (prop === 'axios' || prop === 'constructor' || typeof originalValue !== 'function') {
        return originalValue;
      }
      // Only wrap functions
      return function (this: unknown, ...args: unknown[]) {
        // Wrap the function execution with resilience policy
        // Cockatiel will handle whether the result is a promise or not
        return gaeApiPolicy.execute(
          () => originalValue.apply(obj, args),
        );
      };
    },
  });
}
