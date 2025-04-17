import { BunyanLogger } from './logger';
import { init_browser } from './browser';

const appName = process.env.LOG_NAME ?? process.env.CONFIG_NAME ?? "dev";
export const log: BunyanLogger = init_browser(appName);
if (process.env.LOG_LEVEL !== undefined)
  log.level(Number(process.env.LOG_LEVEL));

// Weirdly, it doesn't appear that the object formatting works in the browser?
log.info(
  `Web logging initialized: ${appName} v${process.env.TC_APP_VERSION} - ${process.env.CONFIG_NAME} - ${process.env.TC_DEPLOYED_AT}`
);