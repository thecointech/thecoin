

// Utility function allows creating singletons based on name.
// Created after encountering issues with augmenting globalThis
// declare global - different imports (when tests can import a
// packages build & src directories) create conflicting types.

// NOTE: There is currently no facility to reset the
// singleton (eg, for tests).  This will be addressed later.

// Define the shape of the basic singleton manager
export type SingletonManager<T, Args extends any[]> = {
  get: (...args: Args) => T;
  // NOTE: It is only possible to set
  // the default (no-args) singleton
  set: (v: T) => void;
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
    args.length > 0 
      ? name + JSON.stringify(args) 
      : name;

  return {
    get: (...args: Args) : T => {
      const key = getKey(...args);
      if (!gt[key]) {
        gt[key] = create(...args);
      }
      keys.add(key);
      return gt[key]!;
    },
    set: (v: T) => {
      if (gt[name]) {
        throw new Error(`Singleton ${name} already set`);
      }
      keys.add(name);
      gt[name] = v;
    },
    reset: () => {
      for (const key of keys) {
        delete gt[key];
      }
      keys.clear();
    },
  }
}
