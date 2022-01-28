import React, { useState, useEffect } from 'react'
import { Datum, Serie } from '@nivo/line'
import { getData, calculateAvgAndArea, DataFormat, createParams, calcAllReturns } from 'containers/ReturnProfile/data'
import range from 'lodash/range'
import { AreaGraph } from './Graph'


export const CustomLayers = () => {

  const [rawData, setRawData] = useState(undefined as DataFormat[]|undefined)
  const [allDatum, setAllDatum] = useState([] as Datum[])
  const [serie, setSerie ] = useState([{
    data: [],
    id: "avg"
  }] as Serie[]);

  const [accountValue,] = useState(1000);

  const maxGraphPoints = 12;

  // First, fetch raw data
  useEffect(() => {
    getData()
    .then(setRawData)
    .catch(err => {
      console.error(err);
      setRawData(undefined)
    })
  }, [setRawData])

  // Next, calculate total returns for all values
  useEffect(() => {
    if (!rawData)
      return;
    const calcValue = (n: number) => accountValue * (n + 1);
    const params = createParams({initialBalance: 100});
    const periodReturns = calcAllReturns(rawData, 60, params);
    const coinReturns = calculateAvgAndArea(periodReturns, 1);
    const datum: Datum[] = coinReturns.map((r, idx): Datum => ({
      x: idx + 1,
      y: calcValue(r.median),
      lowerBound: calcValue(r.lowerBound),
      upperBound: calcValue(r.upperBound)
    }))
    setAllDatum(datum);
  }, [rawData, accountValue]);

  // Finally, filter AllDatum so we have a reasonable amount of data on our screen
  useEffect(() => {
    // Early-exit if we have no data yet
    if (allDatum.length === 0)
      return;
    // We generate an initial value of 1 to prepend to our data
    // as the data does not include time 0
    const init :Datum = {
      lowerBound: 1,
      upperBound: 1,
      x: 0,
      y: 1,
    }
    // Naive approach, we just take the rough number of elements
    const delta = Math.floor( allDatum.length / maxGraphPoints);
    const filtered = range(1, maxGraphPoints + 1).map(idx => allDatum[(idx * delta) - 1]);
    // Create a series using the filtered datum
    setSerie([
      {
        data: [init, ...filtered],
        id: "avg",
      }
    ])
  }, [allDatum, maxGraphPoints])

  return <AreaGraph data={serie} />
}
