import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import { GetRatesApi } from "./pricing/live";
import { loadEnvVars } from "@thecointech/setenv";
import { AxiosRequestConfig } from "axios";
import { mockWarn, mockError } from "@thecointech/logging/mock";

jest.setTimeout(5 * 60 * 1000);


describe('Resilience Testing', () => {
  beforeEach(() => {
    loadEnvVars("prodtest");
    jest.resetAllMocks();
  });

  it('handles successful API calls', async () => {
    const api = GetRatesApi();
    const rate = await api.getSingle(124);
    expect(rate).toBeDefined();
  });

  it('retries on network errors', async () => {
    const api = GetRatesApi();
    const override = injectError(api, { failureCount: 2 });

    try {
      const rate = await api.getSingle(123);
      expect(rate).toBeDefined();
      expect(override.getCallCount()).toBe(3); // 2 failures + 1 success
      expect(mockWarn).toHaveBeenCalledTimes(2);
      expect(mockError).toHaveBeenCalledTimes(0);
    } finally {
      override.dispose();
    }
  }, 60000);

  it('fails after max retries exceeded', async () => {
    const api = GetRatesApi();
    const override = injectError(api, {
      alwaysFail: true,
      errorMessage: 'Service unavailable'
    });

    try {
      await expect(api.getSingle(124)).rejects.toThrow();
      expect(override.getCallCount()).toBe(4); // Max attempts reached
      expect(mockWarn).toHaveBeenCalledTimes(3);
      expect(mockError).toHaveBeenCalledTimes(1);
    } finally {
      override.dispose();
    }
  }, 60000);

  it('simulates circuit breaker opening', async () => {
    const api = GetRatesApi();
    const override = injectError(api, {
      alwaysFail: true,
      errorMessage: 'Service down',
      errorCode: 'ECONNREFUSED'
    });

    try {
      // Make multiple calls to trigger circuit breaker
      const circuitBreakAfter = Number(process.env.RESILIENCE_CIRCUIT_BREAK_AFTER);
      for (let i = 0; i <= circuitBreakAfter; i++) {
        try {
          await api.getSingle(124);
        } catch (error) {
          // Expected to fail
        }
      }
      console.log(JSON.stringify(mockError.mock.calls));


      // Circuit breaker should be open now, so calls should fail fast
      const startTime = Date.now();
      try {
        await api.getSingle(124);
      } catch (error) {
        const duration = Date.now() - startTime;
        // Should fail quickly due to circuit breaker (not wait for full retry cycle)
        expect(duration).toBeLessThan(10); // Should be near-instant
        console.log(JSON.stringify(mockError.mock.calls));
        const errorMessages = mockError.mock.calls.map((call) => call[1]);
        expect(errorMessages).toContain("GAE API circuit breaker opened - service appears down");
      }
    } finally {
      override.dispose();
    }
  }, 120000);
});



interface ErrorInjectionOptions {
  failureCount?: number;
  errorMessage?: string;
  errorCode?: string;
  alwaysFail?: boolean;
  delay?: number;
}

/**
 * Helper function to inject errors into API calls via axios interceptors
 */
function injectError(api: any, options: ErrorInjectionOptions = {}) {
  const {
    failureCount = 2,
    errorMessage = 'socket hang up',
    errorCode = 'ECONNRESET',
    alwaysFail = false,
    delay = 0
  } = options;

  let callCount = 0;
  let interceptorId: number | undefined;

  if (api.axios) {
    interceptorId = api.axios.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        callCount++;

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (alwaysFail || callCount <= failureCount) {
          const error = new Error(errorMessage);
          (error as any).code = errorCode;
          (error as any).config = config;
          throw error;
        }

        return config;
      },
      (error: any) => Promise.reject(error)
    );
  }

  const start = Date.now();
  return {
    interceptorId,
    getCallCount: () => callCount,
    elapsed: () => Date.now() - start,
    dispose: () => {
      // console.log("Elapsed time: ", Date.now() - start);
      if ((api as any).axios && interceptorId !== undefined) {
        (api as any).axios.interceptors.request.eject(interceptorId);
      }
    }
  };
}
