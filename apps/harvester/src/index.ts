import { app, BrowserWindow, shell } from 'electron';
import contextMenu from 'electron-context-menu';
import { harvest } from './Harvester';
import { initScraping } from './scraper_bridge';
import { log } from '@thecointech/logging';
import { RotatingFileStream } from 'bunyan';
import { logsFolder } from './paths';
import { mkdirSync } from 'fs';
import { notifyError } from './Harvester/notify';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (process.env.BREAK_ON_STARTUP === 'true') {
  debugger;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Fix logging first so we get logs from fixToast below
if (process.env.NODE_ENV === 'production')
{
  mkdirSync(logsFolder, { recursive: true });
  log.addStream({
    stream: new RotatingFileStream({
      path: `${logsFolder}/harvest.log`,
      count: 10,
      period: "1d",
    }),
    level: "trace",
  })
}

// We tweak the user data dir to get a clean sandbox in each configuration
const prod = app.getPath('userData');
app.setPath('userData', `${prod}/${process.env.CONFIG_NAME}`);
if (process.env.NODE_ENV !== 'production' || process.env.CONFIG_NAME === 'prodtest') {
  app.setPath('userData', `${prod}/${process.env.CONFIG_NAME}`);
}

log.info(`-----------------------------------------------------------------------------------`);
log.info(`Started Harvester, ${process.env.CONFIG_NAME} v${__VERSION__} - ${__APP_BUILD_DATE__}`);
log.info(`args: ${process.argv}`);

// NOTE: The easiest way to pass through args is to call it like
// <root>harvester.exe --process-start-args="--harvest"
const hasArgument = (arg: string) => !!process.argv.find(op => op.includes(arg))

if (hasArgument("--harvest")) {
  await harvest();
  app.quit();
  process.exit(0);
}

if (hasArgument("--notify")) {
  const r = await notifyError({
    title: "test",
    message: "test",
    actions: ["test"],
  })
  log.info("Test Result: ", r)
  app.quit();
  process.exit(0);
}

// If our first run, patch our windows shortcut
if (hasArgument("--squirrel-firstrun")) {
  if (process.platform === 'win32') {
    const { fixToastButtonsOnWindows } = await import('./Harvester/notify.patch');
    fixToastButtonsOnWindows(app, shell);
  }
}

contextMenu();

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === 'development') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  initScraping();
  createWindow();
});

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
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
