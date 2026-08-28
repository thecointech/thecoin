import { DateTime } from 'luxon';
import { hydrateProcessor, getCreditDetails, getCoinAccountDetails } from './config';
import { getCurrentState } from './state';
import { getAccountData } from './fetchData';
import type { HarvestData, UserData } from './types';
import type { HarvesterReplayCallbacks } from './replay/replayCallbacks';
import { ContractCore } from '@thecointech/contract-core';
import { useSigner } from './signer';

export async function initialize(callback: HarvesterReplayCallbacks) {

  // Initialize
  const stages = await hydrateProcessor();
  if (stages.length == 0) {
    throw new Error('Harvester not configured');
  }

  const lastRun = await getCurrentState();

  const creditDetails = await getCreditDetails();
  if (!creditDetails) {
    throw new Error("Cannot pay bill: Credit Account Details not set");
  }

  const coinDetails = await getCoinAccountDetails();
  if (!coinDetails) {
    throw new Error("Cannot pay bill: Coin Account not set");
  }

  const user: UserData = {
    // Assume `useSigner` is usable (will not throw) due to presence of details
    useSigner,
    coinDetails,
    creditDetails,
    callback: callback,
  }

  const address = coinDetails.address;
  const lastTxDate = lastRun?.date.minus({ week: 1 });
  const { chq, visa } = await getAccountData(callback, lastTxDate);
  const tcCore = await ContractCore.get();
  const coin = await tcCore.balanceOf(address);
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
