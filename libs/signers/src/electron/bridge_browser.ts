import { IpcMain, IpcRenderer } from './electron_types';
import { ElectronSigner } from './signer';

export function bridge(ipc: IpcRenderer|IpcMain) {
  ElectronSigner._ipc = ipc as IpcRenderer;
}
