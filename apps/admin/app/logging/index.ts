import bunyan from 'bunyan';
import path from 'path';
import { mkdirSync } from 'fs';

const folder = '/temp/TheCoin/admin/logs'
const filename = path.join(folder, 'admin.log');

mkdirSync(folder, { recursive: true });

export const log = bunyan.createLogger({
  name: 'rates-patcher',
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
