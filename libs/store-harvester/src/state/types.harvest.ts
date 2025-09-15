import { DateTime } from 'luxon'
import { ChequeBalanceResult, VisaBalanceResult } from '@thecointech/scraper-agent/types';
import currency from 'currency.js'

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
