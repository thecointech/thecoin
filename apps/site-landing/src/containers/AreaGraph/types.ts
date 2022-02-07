
import type { Datum } from '@nivo/line'
import type { CoinReturns } from '../ReturnProfile/data'
// Used internally by actual renderer
export type AreaDatum = Datum & CoinReturns;

// Callback to allow display of additional info from hovered area of the graph
export type OnHoverCallback = (data: AreaDatum) => void;
