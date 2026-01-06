import currency from 'currency.js'
import { DateTime } from 'luxon'
import type { Signer } from 'ethers';
import type { CreditDetails, HarvestData, HarvestDelta } from '@thecointech/store-harvester';
import type { HarvesterReplayCallbacks } from './replay/replayCallbacks';
export type { HarvestData, HarvestDelta, CreditDetails } from '@thecointech/store-harvester';


export type UserData = {
  creditDetails: CreditDetails;
  wallet: Signer;
  // Callback handles errors (& ui updates if run in foreground)
  callback: HarvesterReplayCallbacks;
}

export interface ProcessingStage {
  readonly name: string;
  process: (data: HarvestData, user: UserData, lastState?: HarvestData) => Promise<HarvestDelta>;
}

export const getDataAsDate = (key: string, data?: Record<string, string>) =>
  data?.[key]
    ? DateTime.fromISO(data[key])
    : undefined;

export const getDataAsCurrency = (key: string, data?: Record<string, string>) =>
    data?.[key]
      ? new currency(data[key])
      : new currency(0);
