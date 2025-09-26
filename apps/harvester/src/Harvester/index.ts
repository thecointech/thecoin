import { setCurrentState } from './state';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';
import { closeBrowser } from '@thecointech/scraper/puppeteer';
import { DateTime } from 'luxon';
import { getDataAsDate, HarvestData } from './types';
import { PayVisaKey } from './steps/PayVisa';
import { notifyError } from './notify';
// import { exec } from 'child_process';
import { BackgroundTaskCallback, getErrorMessage } from '@/BackgroundTask';

type Result = "success" | "error" | "skip";
export async function harvest(callback?: BackgroundTaskCallback): Promise<Result> {

  try {

    log.info(`Commencing Harvest`);

    const { stages, state, user } = await initialize(callback);

    log.info(`Resume from last: harvesterBalance ${state.state.harvesterBalance}`);

    // Sanity check - If we have have not run prior
    if (shouldSkipHarvest(state)) {
      return "skip";
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
    return "success";
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`Error in harvest: ${err}`);
    }
    // For now, we have to treat "replay" as the group
    // as we only have a single nesting of background tasks
    callback?.({
      id: "harvest",
      type: "replay",
      completed: true,
      error: getErrorMessage(err),
    })

    await notifyError({
      title: 'Harvester Error',
      message: `Harvesting failed.  Please contact support.`,
      // TODO: Re-enable buttons (this currently hangs on linux)
      // actions: ["Start App"],
    })
    // if (res == "Start App") {
    //   exec(process.argv0);
    // }
    // throw err;
    return "error";
  }
  finally {
    await closeBrowser();
  }
}


export function shouldSkipHarvest(state: HarvestData) {
  const lastDueDate = getDataAsDate(PayVisaKey, state.state.stepData);
  // If we don't have a lastDueDate and 0 balance, we need
  // to check if it's worth running harvester this time.
  // If the nextDueDate is soon it may not be a good idea
  // to transfer $ in just to transfer them back out again.
  if (!lastDueDate && state.state.harvesterBalance?.intValue == 0) {

    const nextDueDate = state.visa.dueDate;
    const cutoff = nextDueDate.minus({ days: 5 });
    const now = DateTime.now();
    // If we are past the cutoff date, we may skip
    if (now >= cutoff) {
      // We skip if nextDueDate has not already passed
      if (now.minus({ days: 1 }) < nextDueDate) {
        log.info(
          'Skipping Harvest because {DueDate} is past {Cutoff}',
          { DueDate: nextDueDate.toSQLDate(), Cutoff: cutoff.toSQLDate() }
        );
        return true;
      }
    }
  }
  return false;
}
