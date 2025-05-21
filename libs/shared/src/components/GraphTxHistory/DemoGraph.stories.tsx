import React from 'react'
import { Story, Meta } from '@storybook/react';
import { GraphTxHistory, Theme } from '.';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { ResponsiveLine, LineSvgProps, Serie } from '@nivo/line'
import { linearGradientDef } from '@nivo/core';
import { CustomLayerProps } from '@nivo/line'
import { LessVars } from "@thecointech/site-semantic-theme/variables";

// const baseDate = DateTime.now().minus({ weeks: 12 });

type GraphTypes = "cash" | "credit" | "coin" | "total";
const defaultArgs = {
  // from: baseDate,
  // to: DateTime.now(),
  increment: 1,
  includeTotal: false,
  weeks: 4,
  type: "cash" as GraphTypes,
  // txFrequency: 5,
  // plugins: [],
  // lineColor: '#61C1B8',
}

const styleById = {

  "$Cash": {
    color: LessVars.theCoinPaletteDarkBlue3,
    strokeWidth: 4,
  },
  "$Credit": {
    color: LessVars.theCoinPrimaryRedNeutral,
    strokeWidth: 4,
  },
  "$Coin": {
    color: LessVars.theCoinPrimaryGreenNeutral,
    strokeWidth: 4,
  },
  "$Total": {
    strokeDasharray: '6, 6',
    strokeWidth: 6,
    color: LessVars.textLightColor,
  },
  default: {
      strokeWidth: 1,
  },
}

const DashedLine = ({
  series,
  lineGenerator,
  xScale,
  yScale,
}: CustomLayerProps) => {
  return series.map(({ id, data }) => (
      <path
          key={id}
          d={
              lineGenerator(
                  data.map(d => ({
                      x: xScale(d.data.x),
                      y: yScale(d.data.y),
                  }))
              )!
          }
          fill="none"
          stroke={styleById[id]?.color}
          style={styleById[id] || styleById.default}
      />
  ))
}

const getSerie = (type: GraphTypes, weeks: number) => {
  switch(type) {
    case "cash":
      return [
        {
          id: "$Cash",
          data: getCashValues(weeks, 3, 7, 100)
        },
      ]
    case "credit":
      return [
        {
          id: "$Cash",
          data: getCashValues(weeks, 6, 7, 100)
        },
        {
          id: "$Credit",
          data: getCashValues(weeks, 3, 6, 0)
        },
      ]
    case "coin":
      return [
        {
          id: "$Cash",
          data: getCashValues(weeks, 3, 7, 100)
        },
        {
          id: "$Credit",
          data: getCashValues(weeks, 3, 6, 0)
        },
        {
          id: "$Coin",
          data: getCoinValues(weeks, 3, 6)
        },
      ]
    case "total":
      return [
        {
          id: "$Cash",
          data: getCashValues(weeks, 3, 7, 100)
        },
        {
          id: "$Credit",
          data: getCreditTotals(weeks, 3, 6, 0)
        },
        {
          id: "$Coin",
          data: getCoinTotals(weeks, 3, 6)
        },
      ]
  }


}


const DemoGraph = (args: typeof defaultArgs) => {



  const da =getSerie(args.type, args.weeks)
  if (args.includeTotal) {
    const cash = da[0].data
    da.push({
      id: "$Total",
      data: Array.from({ length: cash.length }, (_, i) => ({
        x: cash[i].x,
        y: da.reduce((p, d) => p + d.data[i].y, 0),
      }))
    })
  }
  const datum = sliceDatum(da, args.increment)

  const minMax = calcMinMax(datum)
  // const lastDays = datum.map(d => d.data.slice(-1)[0]?.x ?? 0)
  // const maxDay = Math.max(...lastDays)
  const theme: any = {
    lineColors: datum.map(d => styleById[d.id]?.color),
  }
  return (
  <div style={{ height: 1000, width: 1240, padding: '20px', border: "2px solid lightgray" }}>
    <ResponsiveLine
      data={datum}
      colors={theme.lineColors}
      theme={theme}
      tooltip={point => {
        return <div style={{ padding: '5px', border: '1px solid lightgray', borderRadius: '5px', backgroundColor: 'lightgray' }}>
          Day {point.point.data.x}: ${Number(point.point.data.y).toFixed(2)}
          </div>
      }}

      // Basic properties
      enableSlices="x"
      {...commonProperties}
      {...axisProperties(minMax, args.weeks)}
      {...colorProperties(minMax)}
      {...thingsToDisplayProperties()}
      animate={false}
    />
    </div>
  )
}
const template: Story<typeof defaultArgs> = (args) => {
  return <DemoGraph {...args} />
}

export default {
  title: 'Shared/DemoGraph',
  component: DemoGraph,
  argTypes: {
    // lineColor: { control: 'color' },
    // from: { control: 'date' },
    // to: { control: 'date' },
    increment: { control: 'number' },
    type: {
      options: [ "cash", "credit", "coin", "total"],
      control: "select",
    }
  },
} as Meta;

export const Default = template.bind({});
Default.args = defaultArgs;


// ----------------------------------------------------------------
// graph settings below



///////////////////
const commonProperties: Partial<LineSvgProps> = {
  margin: { top: 20, right: 20, bottom: 80, left: 80 },
  enableArea: false,
  enableGridX: true,
  enableGridY: true,
  gridYValues: [0],
  gridXValues: [0],
  curve: "linear"
}

const axisProperties = (minMax: MinMax, weeks: number): Partial<LineSvgProps> => {
  // Create tick values for every week (every 7 days)
  const tickValues = Array.from({ length: weeks + 1 }, (_, i) => i * 7);

  const ratio = minMax.min / (minMax.max - minMax.min);
  const offset = 0.5 + ratio;
  console.log(JSON.stringify(minMax), " - ratio - ", ratio, " - offset - ", offset)

  return {
    axisBottom: {
      format: (value) => {
        const weekNum = Math.floor(value / 7);
        return weekNum === 0 ? 'Start' : `Week ${weekNum}`;
      },
      tickValues,
      tickSize: 5,
      tickPadding: 5,
      renderTick: ({ x, y, value, format }) => {
        const translateY = 72 + (1000 * ratio) - (offset * 150)
        console.log("TranslateY:", translateY)
        return (
          <g transform={`translate(${x},${translateY})`}>
            <line stroke="#555555" y1={-3} y2={3} />
            <text
              textAnchor="middle"
              dominantBaseline="text-before-edge"
              style={{ fontSize: '9px' }}
              y={5}
            >
              {format(value)}
            </text>
          </g>
        )
      }
    },
    axisLeft: {
      format: value => `$${value}`,
    },
    yScale: {
      type: 'linear',
      stacked: false,
      ...minMax,
    },
    xScale: {
      type: 'linear',
      min: 0,
      max: weeks * 7,
      nice: true,
    }
  }
}

type MinMax = ReturnType<typeof calcMinMax>;
const calcMinMax = (datum: Serie[]) => {
  const maxes = datum.map(d => Math.max(...d.data.map(d => d.y as number)));
  const mins = datum.map(d => Math.min(...d.data.map(d => d.y as number)));
  let max = Math.max(100, ...maxes);
  let min = Math.min(-100, ...mins);

  // max / min should have minimum size - $100
  const diff = Math.max(100, max - min);
  // have some padding - 10% each way
  const padding = diff * 0.1;
  min = min - padding;
  max = max + padding;
  // and round to reasonable sig figs.
  // The sig figs are based on diff
  const sigFigs = Math.max(new Decimal(diff).exponent(), 2)
  min = new Decimal(min).toSignificantDigits(sigFigs).toNumber();
  max = new Decimal(max).toSignificantDigits(sigFigs).toNumber();
  return {min, max};
}

const colorProperties = ({min, max}: MinMax) : Partial<LineSvgProps> => ({
  defs: [
    linearGradientDef('gradientA', [
      { offset: 0, color: '#fff' },
      { offset: 100 - (100 * min / max), color: '#fff', opacity: 0 },
    ]),
  ],
  fill: [{ match: '*', id: 'gradientA' }]
})

const thingsToDisplayProperties = () => {
  const properties: Partial<LineSvgProps> = {
    layers: [
      'grid',
      'axes',
      //'lines',
      //'points',
      // "crosshair",
      'mesh',
      "legends",
      DashedLine,
    ],
    useMesh: true,
    enableSlices: false,
    legends: [
      {
        anchor: 'left',
        direction: 'column',
        justify: false,
        translateX: -100,
        translateY: -80,
        itemsSpacing: 2,
        itemDirection: 'top-to-bottom',
        itemWidth: 80,
        itemHeight: 40,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: 'square',
        symbolBorderColor: 'rgba(0, 0, 0, .5)',
      }
    ]
  }
  return properties;
}

const sliceDatum = (datum: Serie[], days: number) => {
  return datum.map(d => ({
    ...d,
    data: d.data.filter(d => Number(d.x) <= days)
  }))
  .map(d => ({
    ...d,
    data: d.data.concat({
      x: days,
      y: d.data[d.data.length - 1].y,
    })
  }))
}

// const cashValues = [
//   [0, 100],
//   [3, 100],
//   [4, 0],
//   [6, 0],
//   [7, 100],
//   [10, 100],
//   [11, 0],
//   [13, 0],
//   [14, 100],
//   [17, 100],
//   [18, 0],
//   [21, 0],
// ]

const getCashValues = (weeks: number, downDay: number, upDay: number, startingValue=100) => {
  const basic = new Array(7 * weeks).fill(startingValue);
  const data = basic.map((d, idx) => idx % 7 >= downDay && idx % 7 < upDay ? startingValue - 100 : d);
  return data.map((d, v) => ({
    x: v,
    y: d,
  }))
}

const getCoinValues = (weeks: number, upDay: number, downDay: number) => {
  const basic = new Array(7 * weeks).fill(0);
  let growth = 0;
  let value = 0;
  for (let i = 0; i < basic.length; i++) {
    value = value * 1.01;
    if (i % 7 == upDay) value += 100;
    if (i % 7 == downDay) value -= 100;
    basic[i] = value;
  }
  return basic.map((d, v) => ({
    x: v,
    y: d,
  }))
}

const getCreditTotals = (weeks: number, downDay: number, upDay: number, startingValue=100) => {
  const basic = new Array(7 * weeks).fill(0);
  let growth = 0;
  let value = 0;
  for (let i = 0; i < basic.length; i++) {
    //if (i % 7 == upDay) value += 100;
    if (i % 7 == downDay) value -= 100;
    basic[i] = value;
    if (i > 21 && (i - 21) % 28 == 0) value += 400;
  }
  return basic.map((d, v) => ({
    x: v,
    y: d,
  }))
}

const getCoinTotals = (weeks: number, upDay: number, downDay: number) => {
  const basic = new Array(7 * weeks).fill(0);
  let growth = 0;
  let value = 0;
  for (let i = 0; i < basic.length; i++) {
    value = value * 1.005;
    if (i % 7 == upDay) value += 100;
    // if (i % 7 == downDay) value -= 100;
    basic[i] = value;
    if (i > 21 && (i - 21) % 28 == 0) value -= 400;
  }
  return basic.map((d, v) => ({
    x: v,
    y: d,
  }))
}
// const creditValues = [
//   [0, 0],
//   [3, 0],
//   [4, -100],
//   [6, -100],
//   [7, 0],
//   [10, 0],
//   [11, -100],
//   [13, -100],
//   [14, 0],
//   [17, 0],
//   [18, -100],
//   [21, -100],
// ]

// const cashValues = getCashValues(4, 3)
// const fullDatum = [
//   // {
//   //   id: "$Credit",
//   //   data: creditValues.map(([x, y]) => ({
//   //     x,
//   //     y,
//   //   }))
//   // },
//   {
//     id: "$Cash",
//     data: cashValues
//   },
// ];
