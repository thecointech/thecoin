import electron from 'electron';
import path from 'path';

export const rootFolder = process.env.HARVESTER_PROFILE_FOLDER
  ? path.resolve(process.env.HARVESTER_PROFILE_FOLDER)
  : electron.app?.getPath('userData') ?? path.resolve('./.cache/' + process.env.CONFIG_NAME);

export const outFolder = path.join(rootFolder, 'output');
export const logsFolder = path.join(rootFolder, 'logs');

const now = Date.now().toString();
export function dbSuffix() {
  // Dev dbs are always one-shot
  if (process.env.CONFIG_NAME === 'development') {
    return `.dev-${now}`;
  }
  else if (process.env.CONFIG_NAME === 'prodtest') {
    return '.test';
  }
  return ''
}
