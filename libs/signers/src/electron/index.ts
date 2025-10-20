import { getAndCacheSigner } from '../cache';
import type { AccountName } from '../names';
import { ElectronSigner } from '@thecointech/electron-signer';

//
// Running in node process in electron
export * from '../names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => new ElectronSigner(name));
