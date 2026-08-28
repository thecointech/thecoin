import currency from 'currency.js'
import { DateTime } from 'luxon'
import type { CoinAccountDetails, CreditDetails, HarvestData, HarvestDelta } from '@thecointech/store-harvester';
import type { HarvesterReplayCallbacks } from './replay/replayCallbacks';
import { Signer } from 'ethers';
export type { HarvestData, HarvestDelta, CreditDetails } from '@thecointech/store-harvester';


export type UserData = {
  useSigner: <T>(cb: (signer: Signer) => Promise<T>) => Promise<T>;
  coinDetails: CoinAccountDetails;
  creditDetails: CreditDetails;
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
      : undefined;
