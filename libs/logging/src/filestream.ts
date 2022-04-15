import { Stream } from 'bunyan';
import { mkdirSync } from 'fs';

export const getFileStream = (name: string, folder: string, rotate: boolean) : Stream => {

  const logfolder = `${folder}/${name}`
  mkdirSync(logfolder, { recursive: true });
  const time = new Date().toISOString().replace(/:/g, "-");
  const filepath = `${logfolder}/${time}.log`

  return {
    level: 'trace',
    type: rotate ? 'rotating-file' : 'file',
    path: filepath,
    period: '1d',   // daily rotation
    count: 30        // keep 3 back copies
  };
}
