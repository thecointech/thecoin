import type { IpcRenderer } from 'electron';
import gmail from '@thecointech/tx-gmail';
import { ConfigStore } from '@thecointech/store';

declare let window: Window & {
  ipcRenderer: Pick<IpcRenderer, "invoke">
};

export async function initGmail() {
  // open IPC bridge to node process.
  gmail.bridge(window.ipcRenderer);
  // Cycle the gmail token
  const token = await ConfigStore.get("gmailcred")
  const newtoken = await gmail.initialize(token)
  ConfigStore.set("gmailcred", newtoken);
}
