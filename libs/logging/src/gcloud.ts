import { getSeqStream } from './streams/seqstream';
import { getGaeStream } from './streams/gaestream';
import { BunyanLogger } from './logger';
import bunyan from 'bunyan';

const appName = process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev";
export const log: BunyanLogger = bunyan.createLogger({
  name: appName,
  streams: [
    getGaeStream(),
    getSeqStream(appName, process.env.URL_SEQ_LOGGING!),
  ]
});
if (process.env.LOG_LEVEL !== undefined)
  log.level(Number(process.env.LOG_LEVEL));

log.info(
  { app: appName, version: process.env.TC_APP_VERSION, config: process.env.CONFIG_NAME, deployedAt: process.env.TC_DEPLOYED_AT },
  'GCloud logging initialized: {app} v{version} - {config} - {deployedAt}'
);