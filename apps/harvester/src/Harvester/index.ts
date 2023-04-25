import { setCurrentState } from './db';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';
import { closeBrowser } from '../scraper/puppeteer';

export async function harvest() {

  try {

    log.info(`Commencing Harvest, ${process.env.CONFIG_NAME} v${__VERSION__}`);

    const { stages, state } = await initialize();

    log.info(`Resume from last: harvesterBalance ${state.state.harvesterBalance}`);

    const nextState = await processState(stages, state);

    await setCurrentState(nextState);

    log.info(`Harvest complete`);
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`"Error in harvest: ${err}`);
    }
    // TODO: Launch app but notify of error (???)

    // throw err;
  }
  await closeBrowser();
}
