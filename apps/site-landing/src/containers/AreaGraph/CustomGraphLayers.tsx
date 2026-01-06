import React from 'react'
import { Defs } from '@nivo/core'
import { area, curveMonotoneX } from 'd3-shape'
import type { DatumValue } from '@nivo/core'
import { ResponsiveLine, LineCustomSvgLayerProps, LineSvgLayer } from '@nivo/line'
import { Tooltip } from './Tooltip'
import type { AreaSeries, AreaDatum, OnClickHandler } from './types'


const AreaLayer = (props: LineCustomSvgLayerProps<AreaSeries>) => {
  const { data, xScale, yScale } = props;
  const innerHeight: number = props.innerHeight;
  const areaGenerator = area<AreaDatum>()
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

const layers: LineSvgLayer<AreaSeries>[] = [

  'grid', 'markers', 'axes', 'areas',
  AreaLayer,
  'crosshair', 'lines', 'points', 'slices', 'mesh', 'legends',
]

const findMaxValue = (serie: AreaSeries[]) =>
  serie.reduce((prev, series) =>
    series.data?.reduce((prev, d) => Math.max(prev, d.upperBound), prev) ?? prev,
    1
  )

const findMinValue = (serie: AreaSeries[]) => {
  const r = serie.reduce((prev, series) =>
    series.data?.reduce((prev: number, d) => Math.min(prev, d.lowerBound), prev) ?? prev,
    0
  )
  return r;
}

type Props =  {
  onClick: OnClickHandler,
  data: AreaSeries[],
  xlegend: string,
}

export const CustomGraphLayers = ({ onClick, data, xlegend }: Props) => {

  return <ResponsiveLine
    margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
    animate={true}
    yScale={{
      type: 'linear',
      stacked: true,
      min: findMinValue(data),
      max: findMaxValue(data),
    }}
    axisBottom={{
      legend: xlegend,
      legendPosition: 'middle',
      legendOffset: 30,
    }}
    axisLeft={{
      format: (v: any) => `$${v}`
    }}
    data={data}
    lineWidth={3}
    curve="monotoneX"
    colors={['#028ee6', '#774dd7']}
    enableGridX={false}
    pointLabelYOffset={0}
    pointSize={12}
    pointColor="white"
    pointBorderWidth={2}
    pointBorderColor={{ from: 'seriesColor', modifiers: [] }}

    onClick={onClick}
    useMesh={true}
    tooltip={Tooltip}
    layers={layers}
  />
}

