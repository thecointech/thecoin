import currency from 'currency.js';
import { DateTime } from 'luxon';
import { initConfig, hydrateProcessor } from './config';
import { initState, getLastState } from './db';
import { getChequingData, getVisaData } from './fetchData';
import { HarvestData } from './types';

export async function initialize() {

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
    toETransfer: lastState?.toETransfer,
  }

  return { stages, state, lastState };
}
