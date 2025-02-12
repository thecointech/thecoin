import electron from 'electron';
import path from 'path';

export const rootFolder = process.env.HARVESTER_PROFILE_FOLDER
  ? path.resolve(process.env.HARVESTER_PROFILE_FOLDER)
  : electron.app?.getPath('userData') ?? path.resolve('./.temp_profile')

export const outFolder = path.join(rootFolder, 'output');
export const logsFolder = path.join(rootFolder, 'logs');

export function dbSuffix() {
  if (process.env.NODE_ENV === 'development') {
    return '.dev';
  }
  else if (process.env.CONFIG_NAME === 'prodtest') {
    return '.test';
  }
  return ''
}
