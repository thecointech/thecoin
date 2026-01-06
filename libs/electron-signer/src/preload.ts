import { contextBridge, ipcRenderer } from "electron";
import { SIGNER_CHANNEL } from "./types";

export function preloadElectronSigner() {
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld(
    "ipcSigner",
    {
      invoke: (...args: any[]) => {
        return ipcRenderer.invoke(SIGNER_CHANNEL, ...args);
      },
    }
  );
}
