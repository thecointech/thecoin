import { BunyanLogger } from './logger.js';
import { init_node } from './node.js';

export const log: BunyanLogger = init_node(process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev");
if (process.env.LOG_LEVEL !== undefined)
  log.level(Number(process.env.LOG_LEVEL));
log.trace('Node logging initialized');
