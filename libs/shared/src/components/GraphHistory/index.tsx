import React from "react";
//import { Bar } from "@nivo/bar";
import { linearGradientDef } from '@nivo/core'
import { Line, Serie, Datum } from '@nivo/line'
import { Transaction } from '@the-coin/tx-blockchain';
import { DateTime } from 'luxon';
import { FXRate, weSellAt } from "../../containers/FxRate";
import { fiatChange } from "../../containers/Account/profit";
import { StepLineLayer } from "./StepLineLayer";

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
  txs: Transaction[],
  fxRates: FXRate[],
  lineColor: string,
  from?: DateTime,
  to?: DateTime,
}

export const GraphHistory = (args: GraphHistoryProps) => {
  return (
    <Line
      data={getAccountSerie(args)}
      {...commonProperties}
      yScale={{
        type: 'linear',
      }}
      xScale={{
        type: 'time',
        format: '%Y-%m-%d',
        useUTC: false,
        precision: 'day',
      }}
      axisBottom={{
        format: '%b %d',
        tickValues: 'every 2 days',
        legendOffset: -12,
      }}
      xFormat="time:%Y-%m-%d"
      colors={[args.lineColor]}
      curve="monotoneX"
      defs={[
        linearGradientDef('gradientA', [
          { offset: 30, color: 'inherit' },
          { offset: 100, color: 'inherit', opacity: 0 },
        ]),
      ]}
      layers={["grid", "axes", "lines", "areas", StepLineLayer, "markers", "legends"]}
      fill={[{ match: '*', id: 'gradientA' }]}
    />
  );
}

const getDateVals = ({ txs, from, to }: GraphHistoryProps) => {
  to = to ?? DateTime.local();
  from = from ?? txs[0].date;
  // We query the fxrates at 4pm (end-of-day) or now, if day is today.
  const eodOffset = 16 - from.setZone("America/New_York").get("hour");
  //from = from.plus({hours: eodOffset});
  return { from, to, eodOffset }
}

// Get balance at moment indicated by 'from'
// This will either be the balance of the tx just prior, or 0 if no tx
const getInitialBalance = ({ txs, from }: GraphHistoryProps) =>
  from
    ? txs.filter(tx => tx.date < from)?.slice(-1)[0]?.balance ?? 0
    : 0;

const getChangeInFiat = (txs: Transaction[], fxRates: FXRate[]) =>
  txs.reduce((tot, tx) => tot + fiatChange(tx, fxRates), 0)

function getAccountSerie(data: GraphHistoryProps): Serie[] {
  const { from, to, eodOffset } = getDateVals(data);
  const { fxRates, txs } = data;
  const numDays = to.diff(from).as("days");
  let balance = getInitialBalance(data);
  const initCostBasis = getChangeInFiat(txs.filter(tx => tx.date < from), fxRates);
  let costBasis = initCostBasis;

  // day-to-day value
  const accountValuesDatum: Datum[] = [];
  // fiat cost: cost of the current account
  //let costBasisDatum: Datum[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = from.plus({ days: i });
    // any transactions this day?
    const daysTxs = txs.filter(tx => tx.date.toISODate() == date.toISODate());

    //costBasis = updateCostBasis(daysTxs, fxRates, costBasis, costBasisDatum)
    //balance = updateAccountValue(date.plus(eodOffset), daysTxs, fxRates, balance, accountValues);

    // update balance to the last balance of the day
    balance = lastItem(daysTxs)?.balance ?? balance;
    costBasis += getChangeInFiat(daysTxs, fxRates);
    // Get the days FX rate at EOD (or now, if EOD is in the future)
    // We do not offset date itself, because we want it to be
    // in the same timezone of the input date (which we assume is the users tz)
    const exRate = weSellAt(fxRates, date.toJSDate());
    accountValuesDatum.push({
      x: date.toISODate(),
      y: exRate * balance,
      costBasis,
    })

  }

  // ensure we have an opening entry on cost basis
  return [
    {
      id: "AccountValue",
      data: accountValuesDatum
    },
    // {
    //   id: "CostBasis",
    //   data: ensureInitEntry(costBasisDatum, from, initCostBasis),
    // }
  ]
}

// function ensureInitEntry(arr: Datum[], from: DateTime, initValue: number) {
//   return (arr[0]?.x != from.toSQLDate())
//     ? [
//       {
//         x: from.toSQLDate(),
//         y: initValue,
//       },
//       ...arr
//     ]
//     : arr;
// }

// function updateCostBasis(daysTxs: Transaction[], fxRates: FXRate[], fiatCost: number, data: Datum[]) {
//   if (daysTxs.length > 0) {

//     fiatCost += getChangeInFiat(daysTxs, fxRates);
//     // Update our cost basis line
//     data.push({
//       x: daysTxs[0].date.toISODate(),
//       y: fiatCost,
//     })
//   }
//   return fiatCost;
// }

// function updateAccountValue(date: DateTime, daysTxs: Transaction[], fxRates: FXRate[], balance: number, costBasis: number, data: Datum[]) {
//   // update balance to the last balance of the day
//   balance = lastItem(daysTxs)?.balance ?? balance;
//   costBasis += getChangeInFiat(daysTxs, fxRates);
//   // Get the days FX rate at EOD (or now, if EOD is in the future)
//   // We do not offset date itself, because we want it to be
//   // in the same timezone of the input date (which we assume is the users tz)
//   const exRate = weSellAt(fxRates, date.toJSDate());
//   data.push({
//     x: date.toISODate(),
//     y: exRate * balance,
//     costBasis,
//   })
//   return balance;
// }
// const toDatum = (tx: Transaction): Datum => ({
//   x: tx.date.toISODate(),
//   y: tx.balance
// })

// function reduceDuplicates(r: Datum[], val: Datum) {
//   const last = r[r.length - 1];
//   if (last?.x == val.x)
//     last.y = val.y;
//   else
//     r.push(val);
//   return r;
// }

function lastItem<T>(arr: T[]): T { return arr[arr.length - 1] }
