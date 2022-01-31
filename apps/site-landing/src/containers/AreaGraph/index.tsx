import React from 'react'
import { CustomGraphLayers, AreaDatum } from './CustomGraphLayers'
import range from 'lodash/range'
import { CoinReturns } from '../ReturnProfile/data'

type Props = {
  maxGraphPoints: number,
  data: CoinReturns[];
}

export const AreaGraph = ({maxGraphPoints, data}: Props) => {

  const datum = data.map((r, idx): AreaDatum => ({
    x: idx,
    y: r.median,
    lowerBound: r.lowerBound,
    upperBound: r.upperBound,
  }));

  // Naive approach, we skip the extra elements
  const step = (datum.length - 1) / maxGraphPoints;
  const filtered = range(0, maxGraphPoints + 1).map(idx => datum[Math.round(idx * step)]);
  // Create a series using the filtered datum
  const serie = [{
    data: filtered,
    id: "avg",
  }]

  return <CustomGraphLayers data={serie} />
}
