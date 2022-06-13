import type { AccountName } from './names';
import { getAndCacheSigner } from './cache.js'
import { loadFromGoogle } from './fromGoogle.js';

//
// This environment is expecting to be run exclusively on GAE.
// Anything running 'prod' locally is expected to be use the
// the 'prod' environment and run 'index_prod'
export * from './names.js';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => loadFromGoogle(name));
