import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "ipcRenderer",
  {
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    },
  }
);

contextBridge.exposeInMainWorld(
  "secrets",
  {
    getFirebaseConfig: () => ipcRenderer.invoke("getFirebaseConfig")
  }
);
