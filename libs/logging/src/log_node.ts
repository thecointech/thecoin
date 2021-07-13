import { BunyanLogger } from './logger';
import { init_node } from './node';

export const log: BunyanLogger = init_node(process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev");
log.trace('Node logging initialized');
if (process.env.LOG_LEVEL)
  log.level(Number(process.env.LOG_LEVEL));
