import type { IpcMain, IpcRenderer } from '@thecointech/electron-utils/types/ipc';
import { ElectronSigner } from './signer';

export function bridge(ipc: IpcRenderer|IpcMain) {
  ElectronSigner._ipc = ipc as IpcRenderer;
}
