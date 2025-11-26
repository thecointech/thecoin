import React, { useEffect, useState } from "react";
import { LineSvgLayer, ResponsiveLine } from '@nivo/line'
import type { Transaction } from '@thecointech/tx-blockchain';
import type { DateTime } from 'luxon';
import type { PluginBalanceMod } from '@thecointech/contract-plugins';
import type { TooltipWidget, TxDatum, LineProps, TxSeries } from "./types";
import type { PartialTheme as PartialNivoTheme } from "@nivo/theming";
import { linearGradientDef } from "@nivo/core";
import { StepLineLayer } from "./StepLineLayer";
import { RawLineLayer } from './RawLineLayer';
import { getAccountSerie } from "./data";
import { Placeholder } from "semantic-ui-react";
import { useFxRates, FxRateReducer } from "../../containers/FxRate";
import Decimal from 'decimal.js-light';
import styles from './styles.module.less';

// Easy access to theme definition
export type Theme = {
  lineColors?: [string, string],
  dotColor: string,
} & PartialNivoTheme;

export type GraphHistoryProps = {
  plugins: PluginBalanceMod[],
  txs: Transaction[],
  height: number,
  theme?: Theme,
  tooltip?: TooltipWidget,
  from?: DateTime,
  to?: DateTime,
}

export const GraphTxHistory = (props: GraphHistoryProps) => {
  const datum = useCalcLimitedFetchSerie(props);
  const minMax = calcMinMax(datum)
  return (
    <div style={{ height: props.height }}>
      {datum.length === 0
        ? <Placeholder id={styles.placeholder}>
            <Placeholder.Image />
          </Placeholder>
        : <ResponsiveLine
            data={[{
              id: "AccountValue",
              data: datum
            }]}
            colors={props.theme?.lineColors}
            tooltip={props.tooltip}
            theme={props.theme}

            // Basic properties
            {...commonProperties}
            {...axisProperties(minMax, datum.length)}
            {...colorProperties(minMax)}
            {...thingsToDisplayProperties(props)}
          />
      }
    </div>
  );
}

// ----------------------------------------------------------------
// Update-limiting function. Try to ensure we only fetch our fx data once.
const useCalcLimitedFetchSerie = (props: GraphHistoryProps) => {

  const [datum, setDatum] = useState([] as TxDatum[]);
  const {rates, fetching} = useFxRates();
  const ratesApi = FxRateReducer.useApi();

  // Run once on page load.  Pass in ratesApi to allow querying missing rates
  useEffect(() => {
    const d = getAccountSerie(props, rates, ratesApi);
    setDatum(d);
  }, [props.from?.toMillis(), props.to?.toMillis()]);

  // On subsequent runs, do not pass in ratesApi
  // so we do not re-query the same rates
  useEffect(() => {
    if (rates.length != 0) {
      const d = getAccountSerie(props, rates);
      setDatum(d);
    }
  }, [rates.length]);

  return fetching > 0
    ? []
    : datum;
}

type MinMax = ReturnType<typeof calcMinMax>;
const calcMinMax = (datum: TxDatum[]) => {
  let max = datum.reduce((p, d) => Math.max(p, d.y, d.costBasis, d.raw), 0) ?? 100;
  let min = datum.reduce((p, d) => Math.min(p, d.y, d.costBasis, d.raw), max) ?? 0;

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

// ----------------------------------------------------------------
// graph settings below
const commonProperties: Partial<LineProps> = {
  margin: { top: 0, right: 0, bottom: 20, left: 40 },
  animate: true,
  enableArea: true,
  enableGridX: false,
  enableGridY: false,
  curve: "monotoneX"
}

const getTickSpacing = (count: number) => {
  if (count <= 10) return "every day";
  if (count <= 50) return "every 2 days";
  // Aprox 20 entries
  if (count <= 600) return "every month";
  // Try to cap at < 15 entries
  else return `every ${Math.ceil(count / 600)} months`;
}
const axisProperties = (minMax: MinMax, count: number) : Partial<LineProps> => ({
  xScale: {
    type: 'time',
    format: '%Y-%m-%d',
    useUTC: false,
    precision: 'day',
  },
  yScale: {
    type: 'linear',
    stacked: false,
    ...minMax,
  },
  axisBottom: {
    format: '%b %d',
    tickValues: getTickSpacing(count),
    tickSize: 0,
    legendOffset: -12,
  },
  axisLeft: {
    format: value => Number(value).toLocaleString(),
    tickValues: 5,
    tickSize: 0,
    tickPadding: 10
  },
  gridYValues: 3,
  xFormat: "time:%Y-%m-%d"
})

const colorProperties = ({min, max}: MinMax) : Partial<LineProps> => ({
  defs: [
    linearGradientDef('gradientA', [
      { offset: 0, color: '#fff' },
      { offset: 100 - (100 * min / max), color: '#fff', opacity: 0 },
    ]),
  ],
  fill: [{ match: '*', id: 'gradientA' }]
})

const thingsToDisplayProperties = (props: GraphHistoryProps): Partial<LineProps> => {
  const layers: LineSvgLayer<TxSeries>[] = [
    //"grid",
    "markers",
    "axes",
    "areas",
    "crosshair",
    "lines",
    //"slices",
    //"points",
    'mesh',
    "legends",
  ];
  if (props.plugins.length) {
    layers.push(RawLineLayer)
  }
  else {
    // The default view includes the raw fiat value
    // shown as a step line
    layers.push(StepLineLayer)
  }
  return {
    layers,
    useMesh: true,
    enableSlices: false,
  };
}
