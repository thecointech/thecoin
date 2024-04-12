// No need to sleep so long
export function sleep() {
  return new Promise(resolve => setTimeout(resolve, 100));
}
