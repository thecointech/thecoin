import { ipcRenderer } from 'electron';
import gmail from '@thecointech/tx-gmail';
import { ConfigStore } from '@thecointech/store';

export async function initGmail() {
  // open IPC bridge to node process.
  gmail.bridge(ipcRenderer);
  // Cycle the gmail token
  const token = await ConfigStore.get("gmailcred")
  const newtoken = await gmail.initialize(token)
  ConfigStore.set("gmailcred", newtoken);
}
