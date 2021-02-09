import React from "react";
//import { Bar } from "@nivo/bar";
import { linearGradientDef } from '@nivo/core'
import { Line, Serie, Datum } from '@nivo/line'
import { Transaction } from '@the-coin/tx-blockchain';
//import { Datum, Line, Serie, Layer, CustomLayerProps, DatumValue } from '@nivo/line'
// const data = [
//   { x: "0", value: 3.3, lineValue: 2.0 },
//   { x: "1", value: 3.5, lineValue: 3.4 },
//   { x: "2", value: 3.8, lineValue: 2.3 },
//   { x: "3", value: 4.1, lineValue: 3.1 },
//   { x: "4", value: 4.4, lineValue: 4.0 },
//   { x: "5", value: 4.7, lineValue: 3.9 },
//   { x: "6", value: 4.9, lineValue: 2.9 },
//   { x: "7", value: 5.2, lineValue: 3.3 }
// ];

// const LineLayer = ({ bars, xScale, yScale }) => {
//   const lineGenerator = line()
//     .x(d => xScale(d.data.index) + d.width / 2)
//     .y(d => yScale(d.data.data.lineValue));

//   return (
//     <path d={lineGenerator(bars)} fill="none" stroke="rgba(200, 30, 15, 1)" />
//   );
// };



const commonProperties = {
  width: 900,
  height: 400,
  margin: { top: 20, right: 20, bottom: 60, left: 80 },
  animate: true,
  //enableSlices: 'x',
}

export type GraphHistoryProps = {
  data: Transaction[]
}
export const GraphHistory = ({ data }: GraphHistoryProps) => (
  <Line
    data={convertData(data)}
    {...commonProperties}
    enableArea={true}
    yScale={{
      type: 'linear',
    }}
    curve="monotoneX"
    defs={[
      linearGradientDef('gradientA', [
        { offset: 0, color: 'inherit' },
        { offset: 100, color: 'inherit', opacity: 0 },
      ]),
    ]}
    fill={[{ match: '*', id: 'gradientA' }]}
  />
);

function convertData(txs: Transaction[]) : Serie[] {
  return [
    {
      id: "Money",
      data: txs.map(toDatum)
    }
  ]
}

const toDatum = (tx: Transaction, index: number) : Datum => ({
  x: index,
  y: tx.balance
})
