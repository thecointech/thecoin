import { getAndCacheSigner } from '../cache.js'
import { ElectronSigner } from './signer.js';
import type { AccountName } from '../names';

//
// Running in browser on GAE
export * from '../names.js';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => new ElectronSigner(name));
