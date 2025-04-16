import { BrowserWindow } from "electron";

declare global {
  var __mainWindowId: number | undefined;
}
export function setMainWindow(mainWindow: BrowserWindow) {
  globalThis.__mainWindowId = mainWindow.id;
}

// NOTE! This is currently unused.  Once we have settled on
// the notification process, we could probably remove it if still unused.
export function getMainWindow() {
  if (!globalThis.__mainWindowId) {
    throw new Error('Main window not set');
  }
  return BrowserWindow.fromId(globalThis.__mainWindowId);
}
