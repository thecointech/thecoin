import { DateTime } from 'luxon';
import { hydrateProcessor, getWallet, getCreditDetails } from './config';
import { getCurrentState } from './db';
import { getChequingData, getVisaData } from './fetchData';
import { HarvestData } from './types';
import { replay } from '../scraper/replay';

export async function initialize() {

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
  // Sub 1 week to ensure payments posted after last run are all counted
  const lastTxDate = lastRun?.date.minus({ week: 1 });
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
