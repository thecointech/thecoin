import currency from 'currency.js';
import { DateTime } from 'luxon';
import { replay } from '../scraper/replay';
import { HarvestData } from './types';
import { hydrateProcessor } from './config';
import { getLastState, setCurrentState } from './db';

// type HarvestAction =
export async function harvest() {

  // Initialize
  const lastState = await getLastState();

  // Initialize data (do we want anything from last state?)
  let state: HarvestData = {
    chq: await replay('chqBalance'),
    visa: await getVisaData(lastState?.visa.history.slice(-1)?.[0]?.date),
    date: DateTime.now(),
    coinBalance: lastState?.coinBalance ?? currency(0),
    payVisa: lastState?.payVisa,
    toCoin: lastState?.toCoin,
  }

  // Restore processing stages from memory
  const stages = await hydrateProcessor();

  for (const stage of stages.filter(s => !!s)) {
    state = await stage!.process(state, lastState);
  }

  await setCurrentState(state);

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

async function getVisaData(lastTxDate?: DateTime) {
  const data = await replay('visaBalance');
  // Only keep the new transactions from history
  const newTransactions = lastTxDate
    ? data.history.filter(row => row.date > lastTxDate)
    : data.history;

  return {
    ...data,
    history: newTransactions,
  }
}
