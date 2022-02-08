import { AreaDatum } from '../AreaGraph/types';
import { CoinReturns } from '../ReturnProfile/data';

/* --- Reducer --- */
export type BenefitsState = {
  readonly results: CoinReturns[];
  readonly hovered?: AreaDatum;
}
export interface IActions {
  setHovered(hovered?: AreaDatum): void;
  reset(): void;
  addResults(results: CoinReturns[]): void;
}
