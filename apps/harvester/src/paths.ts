import electron from 'electron';
import path from 'path';

export const rootFolder = electron.app?.getPath('userData') ?? path.resolve('./root_temp');
export const outFolder = path.join(rootFolder, 'output');
export const logsFolder = path.join(rootFolder, 'logs');
