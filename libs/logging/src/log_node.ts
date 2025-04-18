import { BunyanLogger } from './logger';
import { init_node } from './node';

const appName = process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev";
export const log: BunyanLogger = init_node(appName);
if (process.env.LOG_LEVEL !== undefined)
  log.level(Number(process.env.LOG_LEVEL));

log.info(
  { app: appName, version: process.env.TC_APP_VERSION, config: process.env.CONFIG_NAME, deployedAt: process.env.TC_DEPLOYED_AT },
  'Node logging initialized: {app} v{version} - {config} - {deployedAt}'
);

