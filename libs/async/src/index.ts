// Yield execution
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export { Mutex } from 'async-mutex';
