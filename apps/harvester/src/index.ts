// index.ts — keep this file tiny
import { app } from 'electron';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Keeping this in this small file allows it to exit quickly when installing,
// if it takes too long the installation times-out and appears to fail.
if (require('electron-squirrel-startup')) {
  app.quit();
  process.exit(0);
}

// Start the actual application.
await import("./main");
