import { getAndCacheSigner } from '../cache';
import { ElectronSigner } from './signer';
import type { AccountName } from '../names';
import type { IpcRenderer, IpcMain } from '@thecointech/electron-utils/types/ipc';

//
// Running in browser on GAE
export * from '../names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => new ElectronSigner(name));

export function bridge(_ipc: IpcRenderer|IpcMain) {
  throw new Error("Implemented in env-specific files");
}
