import { getAndCacheSigner } from '../cache';
import { ElectronSigner } from './signer';
import type { AccountName } from '../names';

//
// Running in browser on GAE
export * from '../names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => new ElectronSigner(name));
