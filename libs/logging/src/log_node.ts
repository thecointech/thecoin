import type { AppLogger } from './logger';
import { init_node } from './node';
export { LoggerContext } from './loggerContext'

//
// NOTE:
// BEFORE DOING ANY WORK IN HERE
// https://github.com/thecointech/thecoin/issues/643
// Switch to Pino instead
//

const appName = process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev";
export const log: AppLogger = init_node(appName);
if (process.env.LOG_LEVEL !== undefined)
  log.level(Number(process.env.LOG_LEVEL));

log.info(
  { app: appName, version: process.env.TC_APP_VERSION, config: process.env.CONFIG_NAME, deployedAt: process.env.TC_DEPLOYED_AT },
  'Node logging initialized: {app} v{version} - {config} - {deployedAt}'
);

