import { contextBridge, ipcRenderer } from "electron";
// import gmail from '@thecointech/tx-gmail';

// Whitelist limits invokes to tx-gmail
// const channels = Object.keys(gmail);
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "ipcRenderer",
  {
    invoke: (channel: string, ...args: any[]) => {
      // if (channels.includes(channel))
      return ipcRenderer.invoke(channel, ...args);
    }
  }
);
