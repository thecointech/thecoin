import { EventEmitter } from "node:events";

type EventMap<T> = Record<keyof T, any[]>;

export type EventListeners<T> = {
  [K in keyof T]: T[K] extends readonly any[] ? (...args: T[K]) => void : never;
};

export class AsyncEventEmitter<T extends EventMap<T>> extends EventEmitter<T> {
  async emitWithPromises<K extends keyof T>(event: K, ...args: T[K]) {
    // @ts-ignore -- Can't figure out how to get keyof type to match node defs
    const listeners = this.listeners(event);
    // apply consecutively
    for (const listener of listeners) {
      await listener(...args);
    }
  }
}
