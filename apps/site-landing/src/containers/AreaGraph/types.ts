
import type { Datum } from '@nivo/line'
import type { CoinReturns } from '../BenefitsSimulator/simulator'
// Used internally by actual renderer
export type AreaDatum = Datum & CoinReturns;
export type { PointMouseHandler  as OnClickHandler } from '@nivo/line';
