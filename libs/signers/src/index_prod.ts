import { getAndCacheSigner } from './cache';
import { loadFromDisk } from './fromDisk';
import { loadHardware } from './fromHardware';
import type { AccountName } from './names';

//
// NodeJS (?) environments running locally.
// Should not excute on GAE instances.  Load from disk
// allows restricting access based on account running.
export * from './names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => {
    switch(name) {
      case 'TheCoin': return loadHardware(name);
      case 'Owner': return loadHardware(name);
      default: return loadFromDisk(name);
    }
  });
