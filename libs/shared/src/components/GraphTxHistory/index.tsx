import React, { useEffect, useState } from "react";
import { ResponsiveLine, PointTooltip, LineSvgProps, Serie } from '@nivo/line'
import { Transaction } from '@the-coin/tx-blockchain';
import { DateTime } from 'luxon';
import { TooltipWidget } from "./types";
import { Theme } from "@nivo/core";
import { linearGradientDef } from "@nivo/core";
import { StepLineLayer } from "./StepLineLayer";
import { getAccountSerie } from "./data";
import { Placeholder } from "semantic-ui-react";
import { useFxRates, useFxRatesApi } from "../../containers/FxRate";

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
  const serie = useCalcLimitedFetchSerie(props)
  return (
    <div style={{ height: props.height }}>
      {serie.length == 0
      ? <Placeholder>
          <Placeholder.Image />
        </Placeholder>
      : <ResponsiveLine
          data={serie}
          colors={[props.lineColor, props.dotColor]}
          tooltip={props.tooltip as PointTooltip}
          theme={props.theme}

          // Basic properties
          {...commonProperties}
          {...axisProperties}
          {...colorProperties}
          {...thingsToDisplayProperties}
        />
        }
    </div>
  );
}

// ----------------------------------------------------------------
// Update-limiting function. Try to ensure we only fetch our fx data once.
const useCalcLimitedFetchSerie = (props: GraphHistoryProps) => {
  const {rates} = useFxRates();
  const ratesApi = useFxRatesApi();

  const [serie, setSerie] = useState([] as Serie[])
  // Run once on page load.  Pass in ratesApi to allow querying missing rates
  useEffect(() => {
    const d = getAccountSerie(props, rates, ratesApi);
    setSerie(d);
  }, []);
  // On subsequent runs, do not pass in ratesApi
  // so we do not re-query the same rates
  useEffect(() => {
    const d = getAccountSerie(props, rates);
    setSerie(d);
  }, [rates.length]);

  return serie;
}

// ----------------------------------------------------------------
// graph settings below
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
