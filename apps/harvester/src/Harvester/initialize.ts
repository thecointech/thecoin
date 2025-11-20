import { DateTime } from 'luxon';
import { hydrateProcessor, getWallet, getCreditDetails } from './config';
import { getCurrentState } from './state';
import { getChequingData, getVisaData } from './fetchData';
import type { HarvestData, UserData } from './types';
import type { HarvesterReplayCallbacks } from './replay/replayCallbacks';
import { GetContract } from '@thecointech/contract-core';

export async function initialize(callback: HarvesterReplayCallbacks) {

  // Initialize
  const stages = await hydrateProcessor();
  if (stages.length == 0) {
    throw new Error('Harvester not configured');
  }

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

  const user: UserData = {
    wallet,
    creditDetails,
    callback: callback,
  }

  // Initialize data (do we want anything from last state?)
  // Sub 1 week to ensure payments posted after last run are all counted
  const lastTxDate = lastRun?.date.minus({ week: 1 });
  const visa = await getVisaData(callback, lastTxDate);
  const chq = await getChequingData(callback);
  const tcCore = await GetContract(wallet.provider!);
  const coin = await tcCore.balanceOf(wallet.address);
  let state: HarvestData = {
    chq,
    visa,
    coin,
    date: DateTime.now(),

    delta: [],
    state: lastRun?.state ?? {},
  }

  return { stages, state, user };
}
