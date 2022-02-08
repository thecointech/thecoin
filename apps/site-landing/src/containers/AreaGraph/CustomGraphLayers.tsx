import React from 'react'
import { Defs } from '@nivo/core'
import { area, curveMonotoneX } from 'd3-shape'
import { Datum, ResponsiveLine, Serie, Layer, CustomLayerProps, DatumValue } from '@nivo/line'
import { AreaTooltip } from './Tooltip'


const commonProperties = {
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

const findMaxValue = (serie: Serie[]) =>
  serie.reduce((prev, series) =>
    series.data?.reduce((prev: number, d: Datum) => Math.max(prev, d.upperBound), prev) ?? prev,
    1
  )

const findMinValue = (serie: Serie[]) => {
  const r = serie.reduce((prev, series) =>
    series.data?.reduce((prev: number, d: Datum) => Math.min(prev, d.lowerBound), prev) ?? prev,
    0
  )
  return r;
}

export const CustomGraphLayers = ({ data, xlegend }: { data: Serie[], xlegend: string }) => {
  return <ResponsiveLine
    {...commonProperties}
    yScale={{
      type: 'linear',
      stacked: true,
      min: findMinValue(data),
      max: findMaxValue(data),
    }}
    axisBottom={{
      legend: xlegend
    }}
    data={data}
    lineWidth={3}
    curve="monotoneX"
    colors={['#028ee6', '#774dd7']}
    enableGridX={false}
    pointSize={12}
    pointColor="white"
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}

    sliceTooltip={AreaTooltip}
    layers={layers}
  />
}

