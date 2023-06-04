import currency from 'currency.js'
import { DateTime } from 'luxon'
import type { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types'
import { Signer } from '@ethersproject/abstract-signer';
import type { Replay } from '../scraper/replay';

export type HarvestDelta = {
  // The fiat balance of the harvesters
  // transfers in and out of the coin account
  harvesterBalance?: currency,

  toETransfer?: currency,
  toPayVisa?: currency,

  stepData?: Record<string, string>,
}
export type HarvestData = {

  date: DateTime,

  visa: VisaBalanceResult,
  chq: ChequeBalanceResult,

  // Delta-only changes
  delta: HarvestDelta[],
  // are cumulatively applied to state
  state: HarvestDelta;
}

export type UserData = {
  creditDetails: CreditDetails;
  wallet: Signer;
  replay: Replay;
}
export type { Replay } from '../scraper/replay';

export type CreditDetails = {
  payee: string,
  accountNumber: string,
}

export interface ProcessingStage {
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
