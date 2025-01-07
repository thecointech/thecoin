import { setCurrentState } from './db';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';
import { closeBrowser } from '@thecointech/scraper/puppeteer';
import { DateTime } from 'luxon';
import { getDataAsDate } from './types';
import { PayVisaKey } from './steps/PayVisa';
import { notifyError } from './notify';
import { exec } from 'child_process';

export async function harvest() {

  try {

    log.info(`Commencing Harvest`);

    const { stages, state, user } = await initialize();

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
    const nextState = await processState(stages, state, user);

    if (nextState.errors) {
      const errorSteps = Object.keys(nextState.errors).join(', ');
      await notifyError({
        title: 'Harvester Error',
        message: `Something went wrong in steps: ${errorSteps}.  Please contact support.`,
      });
    }

    if (!process.env.HARVESTER_DRY_RUN) {
      await setCurrentState(nextState);
    }

    log.info(`Harvest complete`);
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`Error in harvest: ${err}`);
    }
    const res = await notifyError({
      title: 'Harvester Error',
      message: `Harvesting failed.  Please contact support.`,
      actions: ["Start App"],
    })
    if (res == "Start App") {
      exec(process.argv0);
    }
    // throw err;
  }
  finally {
    await closeBrowser();
  }
}
