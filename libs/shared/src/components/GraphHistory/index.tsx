import React from "react";
//import { Bar } from "@nivo/bar";
import { linearGradientDef } from '@nivo/core'
import { Line, Serie, Datum } from '@nivo/line'
import { Transaction } from '@the-coin/tx-blockchain';

//import { Datum, Line, Serie, Layer, CustomLayerProps, DatumValue } from '@nivo/line'

const commonProperties = {
  width: 900,
  height: 400,
  margin: { top: 20, right: 20, bottom: 60, left: 80 },
  animate: true,
  enableArea: true,
  enableGridX: false,

  //enableSlices: 'x',
}

export type GraphHistoryProps = {
  data: Transaction[],
  lineColor: string,
}
export const GraphHistory = ({ data, lineColor }: GraphHistoryProps) => (
  <Line
    data={convertData(data)}
    {...commonProperties}
    yScale={{
      type: 'linear',
    }}
    colors={[lineColor]}
    curve="monotoneX"
    defs={[
      linearGradientDef('gradientA', [
        { offset: 30, color: 'inherit' },
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
