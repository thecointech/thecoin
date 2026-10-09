import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

// We tweak the user data dir to get a clean sandbox in each configuration
export const rootFolder = (() => {
  if (process.env.HARVESTER_PROFILE_FOLDER) {
    // Dbg profiles set this to control usage
    return path.resolve(process.env.HARVESTER_PROFILE_FOLDER)
  }
  const rootPath = (
    app?.getPath('userData') ??
    path.resolve('./.cache/')
  );
  return path.join(rootPath, process.env.CONFIG_ENV ?? 'development')
})()

if (app) {
  app.setPath('userData', rootFolder);
}

let rootFolderExists = false;
try {
  rootFolderExists = existsSync(rootFolder);
} catch (err) {
  console.error('Failed to check root folder existence:', err);
}

if (!rootFolderExists) {
  try {
    mkdirSync(rootFolder, { recursive: true });
  } catch (err) {
    console.error('Failed to create root folder:', rootFolder, err);
    throw new Error(`Cannot initialize Harvester: root folder creation failed at ${rootFolder}`);
  }
}

export const logsFolder = path.join(rootFolder, 'logs');

