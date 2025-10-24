import { bridgeElectronSigner } from '@thecointech/electron-signer/bridge';
import { bridgeTxGmail } from '@thecointech/tx-gmail/bridge';
import { ipcMain } from 'electron';
import { AccountName, getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { getFirebaseConfig } from "./firebaseConfig";


export function bridgeAdmin() {
  // Initialize node-side tx-gmail
  bridgeTxGmail(ipcMain);
  bridgeElectronSigner(ipcMain, (id: string) => {
    return getSigner(id as AccountName)
  });

  // Set up secrets handler
  ipcMain.handle('getFirebaseConfig', async (_event) => {
    try {
      return await getFirebaseConfig();
    } catch (err) {
      log.error(`Error getting secret FirebaseConfig:`, err);
      throw err;
    }
  });
}
