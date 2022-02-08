
import type { Datum } from '@nivo/line'
import type { CoinReturns } from '../ReturnProfile/data'
// Used internally by actual renderer
export type AreaDatum = Datum & CoinReturns;

/* --- Reducer --- */
export type HoveredState = {
  readonly hovered?: AreaDatum;
}
export interface IActions {
  setHovered(hovered?: AreaDatum): void;
}
