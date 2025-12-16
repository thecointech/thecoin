

// Utility function allows creating singletons based on name.
// Created after encountering issues with augmenting globalThis
// declare global - different imports (when tests can import a
// packages build & src directories) create conflicting types.

// Define the shape of the basic singleton manager
export type SingletonManager<T, Args extends any[]> = {
  get: (...args: Args) => T;
  reset: () => void;
};

export function defineSingleton<T, Args extends any[] = []>(
  name: string,
  create: (...args: Args) => T,
  // fns?: Record<string, (v: T, ...args: Args) => void>,
): SingletonManager<T, Args> {
  const gt = globalThis as typeof globalThis & {
    [key: string]: T|undefined;
  }
  const keys = new Set<string>();
  const getKey = (...args: Args) =>
    "__singleton__" + name + (args.length > 0
      ? JSON.stringify(args)
      : "");

  return {
    get: (...args: Args) : T => {
      const key = getKey(...args);
      if (!gt[key]) {
        gt[key] = create(...args);
      }
      keys.add(key);
      return gt[key]!;
    },
    reset: () => {
      for (const key of keys) {
        delete gt[key];
      }
      keys.clear();
    },
  }
}
