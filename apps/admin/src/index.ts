import { app, BrowserWindow, session  } from 'electron';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { getCSP } from './csp';
import { ipcMain } from 'electron';
import { log } from '@thecointech/logging';
import gmail from '@thecointech/tx-gmail';
import * as signers from '@thecointech/signers/electron';

// We need to pull in environment vars to load signers
import { getEnvVars } from '@thecointech/setenv';
const vars = getEnvVars();
process.env = {
  ...vars,
  ...process.env,
}

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,

    webPreferences:
    {
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    //   nativeWindowOpen: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open dev tools initially when in development mode
  if (process.env.NODE_ENV === 'development')  mainWindow.webContents.once('dom-ready', () => mainWindow.webContents.openDevTools())
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  log.debug("Creating main window");
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady()
.then(() => {
  log.info("App Ready");
  // Initialize node-side tx-gmail
  gmail.bridge(ipcMain);
  signers.bridge(ipcMain);

  session.defaultSession.webRequest.onHeadersReceived({ urls: ["*://localhost:*/*"] }, (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": getCSP(new URL(details.url))
      }
    })
  })

  if (process.env.NODE_ENV === 'development') {
    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }
})
.catch(console.error);
