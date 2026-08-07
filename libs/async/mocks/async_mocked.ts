// No need to sleep so long
export function sleep() {
  return new Promise(resolve => setTimeout(resolve, 100));
}

export function withTimeout<T>(promise: Promise<T>, _ms: number, _label: string): Promise<T> {
  return promise;
}

export { Mutex } from 'async-mutex';
