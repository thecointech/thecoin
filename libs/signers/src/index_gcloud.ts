import type { AccountName } from './names';
import { getAndCacheSigner } from './cache';
import { loadFromGoogle } from './fromGoogle';

//
// This environment is expecting to be run exclusively on GAE.
// Anything running 'prod' locally is expected to be use the
// the 'prod' environment and run 'index_prod'
export * from './names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => loadFromGoogle(name));
