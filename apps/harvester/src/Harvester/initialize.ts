import { DateTime } from 'luxon';
import { initConfig, hydrateProcessor, getWallet, getCreditDetails } from './config';
import { initState, getCurrentState } from './db';
import { getChequingData, getVisaData } from './fetchData';
import { HarvestData } from './types';
import { replay } from '../scraper/replay';

export async function initialize() {

  await initConfig();
  initState();

  // Initialize
  const stages = await hydrateProcessor();
  const lastRun = await getCurrentState();

  // Ensure we have a wallet, otherwise we can't run
  const wallet = await getWallet();
  if (!wallet) {
    throw new Error('No wallet found');
  }

  const creditDetails = await getCreditDetails();
  if (!creditDetails) {
    throw new Error("Cannot pay bill: Account Details not set");
  }

  const user = {
    wallet,
    replay,
    creditDetails,
  }

  // Initialize data (do we want anything from last state?)
  const lastTxDate = lastRun?.visa.history.slice(-1)?.[0]?.date;
  const chq = await getChequingData();
  const visa = await getVisaData(lastTxDate)
  let state: HarvestData = {
    chq,
    visa,
    date: DateTime.now(),

    delta: [],
    state: lastRun?.state ?? {},
  }



  return { stages, state, user };
}
