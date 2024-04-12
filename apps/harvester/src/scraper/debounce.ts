
// debounce applied per-argument
export function debounce<T, U>(func: (a: T, b: U) => void, timeout = 300){
  let timer: NodeJS.Timeout;
  let lastA: T;
  let lastB: U;
  return (a: T, b: U) => {
    if (a == lastA && b == lastB) {
      clearTimeout(timer);
    }
    lastA = a;
    lastB = b;
    timer = setTimeout(() => func(a, b), timeout);
  };
}
