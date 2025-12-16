import { getAndCacheSigner } from './cache';
import type { AccountName } from './names';
import { ElectronSigner } from '@thecointech/electron-signer';

//
// Electron browser environment (admin app).  This requires
// that the electron preload script has been executed,
// and the bridge has been initialized.
export * from './names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () =>  new ElectronSigner(name));
