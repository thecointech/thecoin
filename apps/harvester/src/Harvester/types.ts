import currency from 'currency.js'
import { DateTime } from 'luxon'
import { ChequeBalanceResult, VisaBalanceResult } from '../scraper/types'


export type HarvestData = {

  date: DateTime,

  visa: VisaBalanceResult,
  chq: ChequeBalanceResult,

  // Temp Actions?
  toCoin?: currency,
  payVisa?: currency,

  coinBalance: currency,
}

export type CreditDetails = {
  payee: string,
  accountNumber: string,
}

export interface ProcessingStage {
  process: (data: HarvestData, lastState?: HarvestData) => Promise<HarvestData>;
}
