import { Invoker } from './types';
import { ElectronSigner } from './signer';

declare let window: Window & {
  ipcSigner: Invoker;
};

export function bridgeBrowser() {
  if (!window.ipcSigner) {
    throw new Error('ElectronSigner: bridgeBrowser: ipcSigner not found.  Ensure preload is called');
  }
  ElectronSigner._ipc = window.ipcSigner;
}
