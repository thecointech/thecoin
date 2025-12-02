

// Utility function allows creating singletons based on name.
// Created after encountering issues with augmenting globalThis
// declare global - different imports (when tests can import a
// packages build & src directories) create conflicting types.

// Define the shape of the basic singleton manager
export type SingletonManager<T, Args extends any[]> = {
  get: (...args: Args) => T;
  set: (v: T) => void;
};

export function defineSingleton<T, Args extends any[] = []>(
  name: string,
  create: (...args: Args) => T,
  // fns?: Record<string, (v: T, ...args: Args) => void>,
): SingletonManager<T, Args> {
  const gt = globalThis as typeof globalThis & {
    [key: string]: T|undefined;
  }
  return {
    get: (...args: Args) : T => {
      if (!gt[name]) {
        gt[name] = create(...args);
      }
      return gt[name]!;
    },
    set: (v: T) => {
      if (gt[name]) {
        throw new Error(`Singleton ${name} already set`);
      }
      gt[name] = v;
    },
    // ...fns,
  }
}
