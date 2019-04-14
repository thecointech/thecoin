import { ImmerReducerClass } from 'immer-reducer';
import { FXRate } from '@the-coin/pricing'

/* --- STATE --- */
type ContainerState = {
  rates: FXRate[];
}

/* --- ACTIONS --- */
interface IActions {
  fetchRateAtDate(date: Date) : Iterator<any>;
  addFxRate(rates: FXRate): void;
}

/* --- EXPORTS --- */

export { IActions, ContainerState };
