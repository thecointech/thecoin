import { AreaDatum } from '../AreaGraph/types';
import { CoinReturns } from '../ReturnProfile/data';

/* --- Reducer --- */
export type BenefitsState = {
  readonly results: CoinReturns[];
  readonly hovered?: AreaDatum;
  readonly percentile: number;
}
export interface IActions {
  setHovered(hovered?: AreaDatum): void;
  reset(): void;
  addResults(results: CoinReturns[]): void;
}
