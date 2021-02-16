import React, { useState, useEffect } from 'react'
import { Defs } from '@nivo/core'
import { area, curveMonotoneX } from 'd3-shape'
import { Datum, Line, Serie, Layer, CustomLayerProps, DatumValue } from '@nivo/line'
import { getData, getAllReturns,calculateAvgAndArea, DataFormat } from 'containers/ReturnProfile/Data'
import range from 'lodash/range'

//const data: Serie[] = generateDrinkStats(18) as any;

const commonProperties = {
    width: 900,
    height: 400,
    margin: { top: 20, right: 20, bottom: 60, left: 80 },
    animate: true,
    enableSlices: 'x' as 'x',
}

const AreaLayer = (props: CustomLayerProps) => {
  const { data, xScale, yScale } = props;
  const innerHeight: number = props.innerHeight;
  const areaGenerator = area<Datum>()
    .x(d => xScale(d.x as DatumValue))
    .y0(d => Math.min(innerHeight, yScale(d.lowerBound)))
    .y1(d => yScale(d.upperBound))
    .curve(curveMonotoneX)

  return (
    <>
      <Defs
        defs={[
          {
            id: 'pattern',
            type: 'patternLines',
            background: 'transparent',
            color: '#3daff7',
            lineWidth: 1,
            spacing: 6,
            rotation: -45,
          },
        ]}
      />
      <path
        d={areaGenerator(data[0].data) ?? undefined}
        fill="url(#pattern)"
        fillOpacity={0.6}
        stroke="#3daff7"
        strokeWidth={2}
      />
    </>
  )
}

const layers: Layer[] = [
    'grid',
    'markers',
    'areas',
    AreaLayer,
    'lines',
    'slices',
    'axes',
    'points',
    'legends',
  ];

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
    const periodReturns = getAllReturns(rawData, 12 * 60, 0);
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

  return <Line
    {...commonProperties}
    yScale={{
      type: 'linear',
      stacked: true,
      min: 0,
    }}
    data={serie}
    lineWidth={3}
    curve="monotoneX"
    colors={['#028ee6', '#774dd7']}
    enableGridX={false}
    pointSize={12}
    pointColor="white"
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}
    layers={layers}
  />
}
