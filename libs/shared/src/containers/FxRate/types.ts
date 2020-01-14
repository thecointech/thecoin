import { FXRate } from '@the-coin/pricing'

/* --- STATE --- */
export type ContainerState = {
  rates: FXRate[];
}

/* --- ACTIONS --- */
export interface IActions {
  fetchRateAtDate(date: Date) : Iterator<any>;
  addFxRate(rates: FXRate): void;
}

/* --- EXPORTS --- */
