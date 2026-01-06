// Yield execution
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { Mutex } from 'async-mutex';
