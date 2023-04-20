import currency from 'currency.js'
import { DateTime } from 'luxon'
import { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types'

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

export type CreditDetails = {
  payee: string,
  accountNumber: string,
}

export interface ProcessingStage {
  process: (data: HarvestData, lastState?: HarvestData) => Promise<HarvestDelta>;
}

export const getDataAsDate = (key: string, data?: Record<string, string>) =>
  data?.[key]
    ? DateTime.fromISO(data[key])
    : undefined;

export const getDataAsCurrency = (key: string, data?: Record<string, string>) =>
    data?.[key]
      ? new currency(data[key])
      : new currency(0);
