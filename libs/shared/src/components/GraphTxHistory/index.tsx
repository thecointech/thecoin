import React from "react";
//import { Bar } from "@nivo/bar";
import { ResponsiveLine, PointTooltip, LineSvgProps } from '@nivo/line'
import { Transaction } from '@the-coin/tx-blockchain';
import { DateTime } from 'luxon';
import { TooltipWidget } from "./types";

import { Theme } from "@nivo/core";
import { linearGradientDef } from "@nivo/core";
import { StepLineLayer } from "./StepLineLayer";
import { getAccountSerie } from "./data";

// Easy access to theme definition
export type { Theme };

export type GraphHistoryProps = {
  txs: Transaction[],
  lineColor: string,
  dotColor: string,
  height: number,
  theme?: Theme,
  tooltip?: TooltipWidget,
  from?: DateTime,
  to?: DateTime,
}

export const GraphTxHistory = (props: GraphHistoryProps) => {
  return (
    <div style={{ height: props.height }}>
      <ResponsiveLine
        data={getAccountSerie(props)}
        colors={[props.lineColor, props.dotColor]}
        tooltip={props.tooltip as PointTooltip}
        theme={props.theme}

        // Basic properties
        {...commonProperties}
        {...axisProperties}
        {...colorProperties}
        {...thingsToDisplayProperties}
      />
    </div>
  );
}


const commonProperties: Partial<LineSvgProps> = {
  margin: { top: 20, right: 20, bottom: 20, left: 80 },
  animate: true,
  enableArea: true,
  enableGridX: false,
  curve: "monotoneX"
}

const axisProperties: Partial<LineSvgProps> = {
  yScale: {
    type: 'linear',
  },
  xScale: {
    type: 'time',
    format: '%Y-%m-%d',
    useUTC: false,
    precision: 'day',
  },
  axisBottom: {
    format: '%b %d',
    tickValues: 'every 2 days',
    legendOffset: -12,
  },
  axisLeft: {
    tickValues: 5,
    tickSize: 0,
    tickPadding: 10
  },
  gridYValues: 5,
  xFormat: "time:%Y-%m-%d"
}

const colorProperties: Partial<LineSvgProps> = {
  defs: [
    linearGradientDef('gradientA', [
      { offset: 30, color: '#97DDD3' },
      { offset: 100, color: '#97DDD3', opacity: 0 },
    ]),
  ],
  fill: [{ match: '*', id: 'gradientA' }]
}

const thingsToDisplayProperties: Partial<LineSvgProps> = {
  layers: [
    "grid",
    "markers",
    "axes",
    "areas",
    "crosshair",
    "lines",
    'mesh',
    "legends",
    StepLineLayer,
  ],

  useMesh: true,
  enableSlices: false,
}
