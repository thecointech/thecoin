import { setCurrentState } from './db';
import { log } from '@thecointech/logging';
import { processState } from './processState';
import { initialize } from './initialize';
import { GetHarvesterApi, GetStatusApi } from '@thecointech/apis/broker';
import { getWallet } from './config';
import { GetSignedMessage } from "@thecointech/utilities/SignedMessages";

export async function harvest() {

  try {

    log.info(`Commencing Harvest, v` + __VERSION__);

    const { stages, state } = await initialize();

    const nextState = await processState(stages, state);

    await setCurrentState(nextState);

    log.info(`Harvest complete`);
    // TODO: brokercad heartbeat
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`"Error in harvest: ${err}`);
    }
    // TODO: Launch app but notify of error

    throw err;
  }
}
