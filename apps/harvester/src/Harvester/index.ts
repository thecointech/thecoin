import { setCurrentState } from './db';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';

export async function harvest() {

  try {

    log.info(`Commencing Harvest, v` + __VERSION__);

    const { stages, state } = await initialize();

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
}
