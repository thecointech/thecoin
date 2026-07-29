import { setCurrentState } from './state';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';
import { getOrCreateInstallationId, getWallet } from './config';
import { reportRunStart, reportRunComplete } from './monitoring';
import { closeBrowser } from '@thecointech/scraper/puppeteer';
import { DateTime } from 'luxon';
import { getDataAsDate, HarvestData } from './types';
import { PayVisaKey } from './steps/PayVisa';
import { notifyError } from '@/notify';
import { HarvesterReplayCallbacks } from './replay/replayCallbacks';
import { BackgroundTaskCallback, getErrorMessage } from '@/BackgroundTask';
import type { Signer } from 'ethers';

type Result = "success" | "error" | "skip";
export async function harvest(uiCallback?: BackgroundTaskCallback): Promise<Result> {

  await using callback = await HarvesterReplayCallbacks.create({
    uiCallback,
    timestamp: Date.now(),
    taskType: "replay",
    sections: ["chqETransfer"],
  });

  // Set once we have a signer, used to report the run's outcome in `finally` below
  let runId: string | undefined;
  let signer: Signer | null = null;
  let installationId: string | undefined;
  let outcome: "succeeded" | "skipped" | "failed" = "failed";
  let failureStages: string[] | undefined;
  let failureCategory: string | undefined;

  try {

    log.info(`Commencing Harvest`);

    // Ensure we have a wallet, otherwise we can't run
    signer = await getWallet();
    if (!signer) {
      throw new Error('No wallet found');
    }

    try {
      installationId = await getOrCreateInstallationId();
      runId = await reportRunStart(signer, installationId, uiCallback ? "manual" : "scheduled");
    } catch (error) {
      log.error(`Failed to report run start: ${getErrorMessage(error)}`);
      // do -NOT- fail for monitoring, we can still run the harvest
    }

    const { stages, state, user } = await initialize(callback, signer);

    log.info(`Resume from last: harvesterBalance ${state.state.harvesterBalance}`);

    // Sanity check - If we have have not run prior
    if (shouldSkipHarvest(state)) {
      outcome = "skipped";
      return "skip";
    }

    const nextState = await processState(stages, state, user);

    if (nextState.errors) {
      failureStages = Object.keys(nextState.errors);
      await notifyError({
        title: 'Harvester Error',
        message: `Something went wrong in steps: ${failureStages.join(', ')}.  Please contact support.`,
      });
    }

    if (!process.env.HARVESTER_DRY_RUN) {
      await setCurrentState(nextState);
    }

    log.info(`Harvest complete`);
    callback.complete({
      result: "success",
    });
    outcome = failureStages ? "failed" : "succeeded";
    failureCategory = failureStages ? "step failure" : undefined;
    return "success";
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`Error in harvest: ${err}`);
    }

    const error = getErrorMessage(err);
    callback.complete({
      error,
    })

    outcome = "failed";
    failureCategory = error;
    failureStages = callback.lastErrorSection ? [callback.lastErrorSection] : undefined;

    const sectionInfo = callback.lastErrorSection
      ? ` (section: ${callback.lastErrorSection})`
      : '';
    await notifyError({
      title: 'Harvester Error',
      message: `Harvesting failed${sectionInfo}.\n${error}\nPlease contact support.`,
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
    if (signer && installationId && runId) {
      try {
        await reportRunComplete(signer, installationId, runId, outcome, { failureStages, failureCategory });
      }
      catch (e) {
        log.error(e, "Failed to report run completion");
        notifyError({
          title: 'Harvester Monitoring Error',
          message: `Harvest ran, but failed to report run completion.\nPlease contact support.`,
        });
      }
    }
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
