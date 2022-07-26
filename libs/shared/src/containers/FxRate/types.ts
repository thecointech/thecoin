import type { FXRate } from '@thecointech/pricing'

/* --- STATE --- */
export type FxRatesState = {
  rates: FXRate[];
  fetching: number;
}

/* --- ACTIONS --- */
export interface IFxRates {
  fetchRateAtDate(date: Date) : Iterator<any>;
}

export type { FXRate };
/* --- EXPORTS --- */
