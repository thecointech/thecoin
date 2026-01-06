import electron from 'electron';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export const rootFolder = process.env.HARVESTER_PROFILE_FOLDER
  ? path.resolve(process.env.HARVESTER_PROFILE_FOLDER)
  : electron.app?.getPath('userData') ?? path.resolve('./.cache/' + process.env.CONFIG_NAME);

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
export const outFolder = path.join(rootFolder, 'output');
export const logsFolder = path.join(rootFolder, 'logs');
