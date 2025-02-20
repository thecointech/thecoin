// debounce applied per-argument with support for any function
export function debounce<F extends (...args: any[]) => void>(
  func: F,
  timeout = 300
): (...args: Parameters<F>) => void {
  let timer: NodeJS.Timeout;
  let lastArgs: Parameters<F> | undefined;

  return (...args: Parameters<F>) => {
    if (lastArgs && args.every((arg, i) => arg === lastArgs![i])) {
      clearTimeout(timer);
    }
    lastArgs = args;
    timer = setTimeout(() => func(...args), timeout);
  };
}
