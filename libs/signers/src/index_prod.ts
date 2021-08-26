import { AccountName } from './names';
import { getAndCacheSigner } from './cache'
import { loadFromDisk } from './fromDisk';

//
// NodeJS (?) environments running locally.
// Should not excute on GAE instances.  Load from disk
// allows restricting access based on account running.
export * from './names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => loadFromDisk(name));
