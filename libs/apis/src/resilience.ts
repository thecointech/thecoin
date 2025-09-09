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
  halfOpenAfter: Number(process.env.RESILIENCE_HALF_OPEN_AFTER ?? 60000),  // Try again after 1 minute
  breaker: new ConsecutiveBreaker(Number(process.env.RESILIENCE_BREAKER_CONSECUTIVE ?? 5)) // Break after 5 consecutive failures
});

// Combined policy for GAE API calls (no timeout - let axios handle it)
export const gaeApiPolicy = wrap(
  apiRetryPolicy,
  gaeCircuitBreaker
);

// Add event logging to individual policies
apiRetryPolicy.onRetry(({ attempt, delay }) => {
  log.warn(`Retrying GAE API (attempt ${attempt}) after ${delay}ms delay`);
});

apiRetryPolicy.onGiveUp(params => {
  ("error" in params)
    ? log.error(params.error, "GAE API retry exceeded max attempts")
    : log.error(params, "GAE API retry policy exceeded");
});

gaeCircuitBreaker.onBreak(() => {
  log.error('GAE API circuit breaker opened - service appears down');
});

gaeCircuitBreaker.onReset(() => {
  log.info('GAE API circuit breaker reset - service recovered');
});

/**
 * Creates a proxy that automatically wraps method calls with GAE resilience policies
 */
export function createGaeServiceProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      // axios is a getter, not a property
      if (prop === "axios") {
        return target[prop as keyof T];
      }
      const originalValue = Reflect.get(target, prop, receiver);

      // Only wrap functions
      if (typeof originalValue === 'function') {
        return function(this: any, ...args: any[]) {
          // Wrap the function execution with resilience policy
          // Cockatiel will handle whether the result is a promise or not
          return gaeApiPolicy.execute(() => originalValue.apply(this, args));
        };
      }

      // For non-function properties, return as-is
      return originalValue;
    }
  });
}
