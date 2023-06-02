import electron from 'electron';
import path from 'path';

export const rootFolder = electron.app?.getPath('userData') ?? '.';
export const outFolder = path.join(rootFolder, 'output');
