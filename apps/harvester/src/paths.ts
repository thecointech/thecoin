import electron from 'electron';
import path from 'path';

export const outFolder = path.join(electron.app.getPath('userData'), 'output');
