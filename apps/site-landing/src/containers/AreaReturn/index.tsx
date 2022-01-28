import React from 'react'
import { Datum } from '@nivo/line'
import { CustomGraphLayers } from './Graph'
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

  // We generate an initial value of 1 to prepend to our data
  // as the data does not include time 0
  const init :Datum = {
    lowerBound: 1,
    upperBound: 1,
    x: 0,
    y: 1,
  }
  // Naive approach, we just take the rough number of elements
  const delta = Math.floor( datum.length / maxGraphPoints);
  const filtered = range(1, maxGraphPoints + 1).map(idx => datum[(idx * delta) - 1]);
  // Create a series using the filtered datum
  const serie = [{
    data: [init, ...filtered],
    id: "avg",
  }]

  return <CustomGraphLayers data={serie} />
}
