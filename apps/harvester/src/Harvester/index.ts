import currency from 'currency.js';
import { DateTime } from 'luxon';
import { HarvestData } from './types';
import { hydrateProcessor, initConfig } from './config';
import { getLastState, setCurrentState, initState } from './db';
import { getChequingData, getVisaData } from './fetchData';
import { log } from '@thecointech/logging';

// type HarvestAction =
export async function harvest() {

  try {

    await initConfig();
    initState();
    // Initialize
    const stages = await hydrateProcessor();
    const lastState = await getLastState();

    // Initialize data (do we want anything from last state?)
    const lastTxDate = lastState?.visa.history.slice(-1)?.[0]?.date;
    const chq = await getChequingData();
    const visa = await getVisaData(lastTxDate)
    let state: HarvestData = {
      chq,
      visa,
      date: DateTime.now(),
      // Note, we don't use the actual coin balance because we want the
      // harvesters actions to be independent of any other actions
      // happening (eg manual xfer in & out).
      coinBalance: lastState?.coinBalance ?? currency(0),

      payVisa: lastState?.payVisa,
      toCoin: lastState?.toCoin,
    }

    for (const stage of stages.filter(s => !!s)) {
      state = await stage!.process(state, lastState);
    }

    await setCurrentState(state);
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      log.fatal(err, "Error in harvest, aborting");
    }
    else {
      log.fatal(`"Error in harvest: ${err}`);
    }
  }

  // // OPTIONAL: Transfer payment for existing purchases to TheCoin
  // const state1 = new TransferVisaOwing(lastState).process(state);

  // // OPTIONAL: If we need to transfer anything, round up to the nearest transfer block size
  // const state2 = new RoundUp(100).process(state1);

  // // Optional: Transfer everything in the chequing account
  // const state3 = new TransferEverything().process(state2);

  // // OPTIONAL: Ensure we don't transfer more than we have in the chequing account
  // const state4 = new TransferLimit(200).process(state3);

  // // If there is an amount to transfer in, then do it.
  // if (state4.toCoin) {
  //   console.log(`Transferring ${state4.toCoin} to TheCoin`);
  //   const confirm = await replay('chqETransfer', { amount: state4.toCoin.toString() });
  //   if (confirm.confirm) {
  //     console.log(`Successfully transferred ${state4.toCoin} to TheCoin`);
  //   } else {
  //     console.log(`Failed to transfer ${state4.toCoin} to TheCoin`);
  //     // TODO: Handle this case
  //   }
  // }

  // const state5 = new PayVisa(3).process(state4, lastState);
  // TRANSFER IN
  // TransferIn: if (transferIn > 0)

  // TRANSFER OUT:
  // PayVisa: if (transferOut > 0 && dueDate > lastDueDate)

}

