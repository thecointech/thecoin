
import type { LineSeries, PointOrSliceMouseHandler } from '@nivo/line'
import type { CoinReturns } from '../BenefitsSimulator/simulator'
// Used internally by actual renderer

export type AreaDatum = LineSeries['data'][number] & {
  lowerBound: number,
  upperBound: number,
} & Partial<CoinReturns>

export type AreaSeries = Omit<LineSeries, 'data'> & {
  data: AreaDatum[]
}

export type OnClickHandler = PointOrSliceMouseHandler<AreaSeries>;
