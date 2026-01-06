import { loadFromDisk } from './fromDisk';
import { getAndCacheSigner } from './cache';
import type { AccountName } from "./names";

//
// Prodtest should use private keys defined in .env file.
export * from './names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => loadFromDisk(name));
