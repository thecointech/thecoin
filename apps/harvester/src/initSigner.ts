import { bridgeElectronSigner } from "@thecointech/electron-signer/bridge";
import { ipcMain } from 'electron';
import { useSigner } from "./Harvester/signer";
import { NormalizeAddress } from "@thecointech/utilities";
// Initialize main process configurations

export function initSigner() {
  bridgeElectronSigner(ipcMain, async (signerId) => {
    const wallet = await useSigner(async (signer) => {
      const address = await signer.getAddress();
      if (NormalizeAddress(address) === NormalizeAddress(signerId)) {
        return signer;
      }
      return undefined;
    });
    return wallet ?? undefined;
  }, false);
}
