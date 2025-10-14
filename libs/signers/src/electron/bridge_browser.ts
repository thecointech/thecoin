import type { IpcRenderer } from '@thecointech/electron-utils/types/ipc';
import { ElectronSigner } from './signer';

export function bridge(ipc: IpcRenderer) {
  ElectronSigner._ipc = ipc;
}
