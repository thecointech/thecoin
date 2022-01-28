import React from 'react'
import { Datum } from '@nivo/line'
import { CustomGraphLayers } from './CustomGraphLayers'
import range from 'lodash/range'

type AreaDatum = {
  mean: number;
  median: number;
  lowerBound: number;
  upperBound: number;
  values: number[];
}

type Props = {
  maxGraphPoints: number,
  data: AreaDatum[];
}


export const AreaGraph = ({maxGraphPoints, data}: Props) => {

  const datum: Datum[] = data.map((r, idx): Datum => ({
    x: idx + 1,
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
