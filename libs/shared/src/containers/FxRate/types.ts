import type { FXRate } from '@thecointech/pricing'

/* --- STATE --- */
export type FxRatesState = {
  rates: FXRate[];
  inFlight: number[]; // Timestamps of rates currently being fetched
}

/* --- ACTIONS --- */
export interface IFxRates {
  fetchRateAtDate(date: Date) : Iterator<any>;
  fetchRatesForDates(dates: Date[]) : Iterator<any>;
}

export type { FXRate };
/* --- EXPORTS --- */
