import bunyan from 'bunyan';
import path from 'path';
import { mkdirSync } from 'fs';


export const log : bunyan = null as any;

export function init(name: string) {
  const folder =`/temp/TheCoin/${name}/logs`;
  const filename = path.join(folder, `${name}.log`);
  
  // TODO: Obvs, we can't do this on appengine/browser.
  mkdirSync(folder, { recursive: true });
  bunyan.createLogger({
    name,
    streams: [
      {
        level: 'trace',
        stream: process.stdout            // log INFO and above to stdout
      },
      {
        level: 'debug',
        type: 'rotating-file',
        path: filename,
        period: '1d',   // daily rotation
        count: 3        // keep 3 back copies
      }
    ]
  });
  
  log.trace('Logging Initialized to path: ' + filename);
}

