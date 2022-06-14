import { BunyanLogger } from './logger.js';
import { init_browser } from './browser.js';

export const log: BunyanLogger = init_browser(process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev");
if (process.env.LOG_LEVEL !== undefined)
  log.level(Number(process.env.LOG_LEVEL));
log.trace('Web logging initialized');
