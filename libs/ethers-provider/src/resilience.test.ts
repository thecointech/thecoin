import { expect, it, jest, beforeEach } from "@jest/globals";
import { describe } from "@thecointech/jestutils";
import { ifPolygonscan, ifSecret } from "@thecointech/secrets/jestutils";
import { getProvider } from "./node/remote";
import { mockWarn, mockError } from "@thecointech/logging/mock";

jest.setTimeout(5 * 60 * 1000);


describe('Ethereum Provider Resilience Testing', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('handles successful RPC calls', async () => {
    const provider = await getProvider();
    const blockNumber = await provider.getBlockNumber();
    expect(typeof blockNumber).toBe('number');
    expect(blockNumber).toBeGreaterThan(0);
  });

  it('retries on network errors', async () => {
    const provider = await getProvider();
    const override = injectProviderError(provider, 'getBlockNumber', { failureCount: 2 });

    try {
      const blockNumber = await provider.getBlockNumber();
      expect(typeof blockNumber).toBe('number');
      expect(override.getCallCount()).toBe(3); // 2 failures + 1 success
      expect(mockWarn).toHaveBeenCalledTimes(2);
      expect(mockError).toHaveBeenCalledTimes(0);
    } finally {
      override.dispose();
    }
  }, 60000);

  it('fails after max retries exceeded', async () => {
    const provider = await getProvider();
    const override = injectProviderError(provider, 'getBlockNumber', {
      alwaysFail: true,
      errorMessage: 'RPC service unavailable'
    });

    try {
      await expect(provider.getBlockNumber()).rejects.toThrow();
      expect(override.getCallCount()).toBe(5); // Max attempts reached
      expect(mockWarn).toHaveBeenCalledTimes(4);
      expect(mockError).toHaveBeenCalledTimes(1);
    } finally {
      override.dispose();
    }
  }, 60000);

  it('handles different RPC methods with resilience', async () => {
    const provider = await getProvider();
    const override = injectProviderError(provider, 'getBalance', { failureCount: 1 });

    try {
      // Test with a known address (zero address)
      const balance = await provider.getBalance('0x0000000000000000000000000000000000000000');
      expect(balance).toBeDefined();
      expect(override.getCallCount()).toBe(2); // 1 failure + 1 success
    } finally {
      override.dispose();
    }
  }, 60000);

  it('simulates circuit breaker opening for RPC calls', async () => {
    const provider = await getProvider();
    const override = injectProviderError(provider, 'getBlockNumber', {
      alwaysFail: true,
      errorMessage: 'RPC node down',
      errorCode: 'ECONNREFUSED'
    });

    try {
      // Make multiple calls to trigger circuit breaker
      for (let i = 0; i < 12; i++) {
        try {
          await provider.getBlockNumber();
        } catch (error) {
          // Expected to fail
        }
      }

      // Circuit breaker should be open now, so calls should fail fast
      const startTime = Date.now();
      try {
        await provider.getBlockNumber();
      } catch (error) {
        const duration = Date.now() - startTime;
        // Should fail quickly due to circuit breaker (not wait for full retry cycle)
        expect(duration).toBeLessThan(500); // Less than 0.5 seconds
      }
    } finally {
      override.dispose();
    }
  }, 120000);

  it('does not wrap non-RPC methods', async () => {
    const provider = await getProvider();

    // Test that non-RPC methods are not wrapped
    const network = await provider.getNetwork();
    expect(network).toBeDefined();
    expect(network.name).toBeDefined();

    // This should work without any resilience wrapping
    const projectId = provider.projectId;
    expect(projectId).toBeDefined();
  });
}, await ifSecret("InfuraProjectId"));



interface ErrorInjectionOptions {
  failureCount?: number;
  errorMessage?: string;
  errorCode?: string;
  alwaysFail?: boolean;
  delay?: number;
}

/**
 * Helper function to inject errors into Ethereum provider calls
 */
function injectProviderError(provider: any, methodName: string, options: ErrorInjectionOptions = {}) {
  const {
    failureCount = 2,
    errorMessage = 'network error',
    errorCode = 'NETWORK_ERROR',
    alwaysFail = false,
    delay = 0
  } = options;

  let callCount = 0;
  const originalMethod = provider[methodName];

  if (!originalMethod) {
    throw new Error(`Method ${methodName} not found on provider`);
  }

  const mockMethod = jest.fn().mockImplementation(async (...args: any[]) => {
    callCount++;

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (alwaysFail || callCount <= failureCount) {
      const error = new Error(errorMessage);
      (error as any).code = errorCode;
      throw error;
    }

    return originalMethod.apply(provider, args);
  });

  provider[methodName] = mockMethod;

  const start = Date.now();
  return {
    getCallCount: () => callCount,
    elapsed: () => Date.now() - start,
    dispose: () => {
      provider[methodName] = originalMethod;
    }
  };
}
