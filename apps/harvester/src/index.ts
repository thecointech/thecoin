// index.ts — keep this file tiny
import { app, dialog } from 'electron';
import { initLogging } from './logging';
import { hasArgument } from './arguments';
import { initScraper } from './initScraper';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Keeping this in this small file allows it to exit quickly when installing,
// if it takes too long the installation times-out and appears to fail.
if (require('electron-squirrel-startup')) {
  app.quit();
  process.exit(0);
}

// Start the actual application.
try {
 
  initLogging();
  initScraper();

  if (hasArgument("--harvest")) {
    const { harvest } = await import('./Harvester');
    const r = await harvest();
    app.quit();
    process.exit(r === "error" ? 1 : 0);
  }

  // Testing arguments
  else if (hasArgument("--notify") || hasArgument("--ask-input")) {
    const { runCli } = await import('./cli');
    await runCli();
  }

  else {
    await import("./main");
  }
} catch (err: any) {
  const message = err?.stack ?? err?.message ?? String(err);

  // Show a native error dialog for fatal startup failures.
  // This catches things like missing VC++ redist DLLs that prevent
  // a native .node module (onnxruntime, etc.) from loading.
  const isNativeModuleError = /\.node/.test(message) && /specified module could not be found/i.test(message);
  const body = isNativeModuleError
    ? `A required system component is missing and Harvester cannot start.\n\nPlease install the Microsoft Visual C++ Redistributable (x64) and try again.\n\nError: ${err?.message ?? err}`
    : `Harvester could not start.\n\n${message}`;
  try {
    dialog.showErrorBox('Harvester could not start', body);
  } catch {
    // If even the dialog fails, at least fall back to the console.
    console.error(body);
  }

  throw err;
}