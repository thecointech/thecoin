import { Stream } from 'bunyan';
import { mkdirSync } from 'fs';

export const getFileStream = (name: string, folder: string, rotate: boolean) : Stream => {

  // TODO: Obvs, we can't do this on appengine/browser.
  mkdirSync(folder, { recursive: true });
  const filepath = `${folder}/${name}.log`

  return {
    level: 'debug',
    type: rotate ? 'rotating-file' : 'file',
    path: filepath,
    period: '1d',   // daily rotation
    count: 3        // keep 3 back copies
  };
}
