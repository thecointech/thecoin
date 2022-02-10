
import type { ApplicationRootState } from 'types'
import { BaseReducer } from '@thecointech/shared/store/immerReducer';
import { BenefitsState, IActions } from './types';
import { CoinReturns } from '../ReturnProfile/data';
import { AreaDatum } from '../AreaGraph/types';

const HOVERED_KEY: keyof ApplicationRootState = "hovered";
const initialState = { hovered: undefined, results: [] };

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
