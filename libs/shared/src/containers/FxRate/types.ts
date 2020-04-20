import {FXRate} from '@the-coin/pricing'
export type { FXRate } from '@the-coin/pricing'

/* --- STATE --- */
export type FxRatesState = {
  rates: FXRate[];
}

/* --- ACTIONS --- */
export interface IFxRates {
  fetchRateAtDate(date: Date) : Iterator<any>;
}

/* --- EXPORTS --- */
