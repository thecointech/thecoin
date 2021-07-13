import { BunyanLogger } from './logger';
import { init_browser } from './browser';

export const log: BunyanLogger = init_browser(process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev");
log.trace('Web logging initialized');
if (process.env.LOG_LEVEL)
  log.level(Number(process.env.LOG_LEVEL));
