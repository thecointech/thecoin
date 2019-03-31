import { ImmerReducer } from 'immer-reducer';
import { FXRate } from '@the-coin/pricing'

/* --- STATE --- */
interface ContainerState extends FXRate {
}

/* --- ACTIONS --- */
interface IActions extends ImmerReducer<ContainerState> {
  beginUpdateFxRate() : Iterator<any>;
  updateFxRate(newRate: FXRate): void;
}

/* --- EXPORTS --- */

export { IActions, ContainerState };
