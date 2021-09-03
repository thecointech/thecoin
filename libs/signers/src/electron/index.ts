import { AccountName } from '../names';
import { getAndCacheSigner } from '../cache'
import { ElectronSigner } from './signer';

//
// Running in browser on GAE
export * from '../names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => new ElectronSigner(name));
