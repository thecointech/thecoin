import currency from 'currency.js'
import { DateTime } from 'luxon'
import type { ChequeBalanceResult, VisaBalanceResult } from './scraper';
import type { Signer } from 'ethers';

export type HarvestDelta = {
  // The fiat balance of the harvesters
  // transfers in and out of the coin account
  harvesterBalance?: currency,

  // How much to transfer to TheCoin
  // Should be 0 at the end of every run
  toETransfer?: currency,
  // A pending payment to the Visa
  // Set in the run when initiated, cleared
  // in a later run when it's settled
  toPayVisa?: currency,
  // When the pending payment above is scheduled to settle
  toPayVisaDate?: DateTime,

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

  // Errors for the current run only (indexed by step name)
  errors?: Record<string, string>,
}

export type UserData = {
  creditDetails: CreditDetails;
  wallet: Signer;
}

export type CreditDetails = {
  payee: string,
  accountNumber: string,
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
