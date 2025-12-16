
import type { ApplicationRootState } from 'types'
import { BaseReducer } from '@thecointech/redux';
import { BenefitsState, IActions } from './types';
import { CoinReturns } from './simulator';
import { AreaDatum } from '../AreaGraph/types';

const HOVERED_KEY: keyof ApplicationRootState = "hovered";
const initialState = {
  percentile: 0.95,
  results: []
};

export class BenefitsReducer extends BaseReducer<IActions, BenefitsState>(HOVERED_KEY, initialState)
  implements IActions {
  reset(): void {
    this.draftState.results = [];
    this.draftState.hovered = undefined;
  }

  addResults(newResults: CoinReturns[]): void {
    this.draftState.results = this.state.results.concat(newResults);
  }

  setHovered(hovered?: AreaDatum): void {
    this.draftState.hovered = hovered;
  }
}
