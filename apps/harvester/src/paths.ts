import electron from 'electron';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export const rootFolder = process.env.HARVESTER_PROFILE_FOLDER
  ? path.resolve(process.env.HARVESTER_PROFILE_FOLDER)
  : electron.app?.getPath('userData') ?? path.resolve('./.cache/' + process.env.CONFIG_NAME);

if (!existsSync(rootFolder)) {
  mkdirSync(rootFolder, { recursive: true });
}
export const outFolder = path.join(rootFolder, 'output');
export const logsFolder = path.join(rootFolder, 'logs');
