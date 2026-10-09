import { RotatingFileStream } from 'bunyan';
import { mkdirSync } from 'fs';
import { log } from '@thecointech/logging';
import { logsFolder } from './paths';

export function initLogging() {

  // Fix logging first so we get logs from fixToast below
  if (process.env.NODE_ENV === 'production') {
    mkdirSync(logsFolder, { recursive: true });
    log.addStream({
      stream: new RotatingFileStream({
        path: `${logsFolder}/harvest.log`,
        count: 10,
        period: "1d",
      }),
      level: "trace",
    })
  }

  log.info(`-----------------------------------------------------------------------------------`);
  // NOTE: The standard initialized message does not get added to the log file,
  // because the log file stream is added after the standard logging is initialized
  log.info(
    { args: process.argv.slice(2), version: process.env.TC_APP_VERSION, config: process.env.CONFIG_NAME, deployedAt: process.env.TC_DEPLOYED_AT },
    'Harvester logging initialized: v{version} - {config} - {deployedAt}'
  );

  log.info("Resources path: ", process.resourcesPath);
}