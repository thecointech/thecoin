import { setCurrentState } from './db';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';
import { closeBrowser } from '../scraper/puppeteer';
import { DateTime } from 'luxon';
import { getDataAsDate } from './types';
import { PayVisaKey } from './steps/PayVisa';

export async function harvest() {

  try {

    log.info(`Commencing Harvest`);

    const { stages, state } = await initialize();

    log.info(`Resume from last: harvesterBalance ${state.state.harvesterBalance}`);

    // Sanity check - If we have have not run prior
    const lastDueDate = getDataAsDate(PayVisaKey, state.state.stepData);
    if (!lastDueDate && state.state.harvesterBalance?.intValue == 0) {
      // and are too close to the due date, there isn't much
      // point transferring in & straight back out, so skip this run
      const cutoff = DateTime.now().minus({ days: 5 });
      if (state.visa.dueDate > cutoff) {
        log.info(
          'Skipping Harvest because {DueDate} is past {Cutoff}',
          { DueDate: state.visa.dueDate.toSQLDate(), Cutoff: cutoff.toSQLDate() }
        );
        return;
      }
    }
    const nextState = await processState(stages, state);

    await setCurrentState(nextState);

    log.info(`Harvest complete`);
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`Error in harvest: ${err}`);
    }
    // TODO: Launch app but notify of error (???)

    // throw err;
  }
  await closeBrowser();
}
