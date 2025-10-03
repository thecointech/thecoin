import { toHuman, toHumanDecimal } from "@thecointech/utilities/Conversion";
import { fiatChange } from "../../containers/Account/profit";
import { DateTime } from "luxon";
import { weSellAt } from '@thecointech/fx-rates';
import Decimal from 'decimal.js-light';
import type { FXRate } from "@thecointech/pricing";
import type { Transaction } from "@thecointech/tx-blockchain";
import type { IFxRates } from "../../containers/FxRate";
import type { GraphHistoryProps } from ".";
import type { TxDatum } from "./types";

export const MarketTZ = "America/New_York";

export const getDateVals = ({ txs, from, to }: Pick<GraphHistoryProps, "txs"|"from"|"to">) => {
  to = to ?? DateTime.local();
  from = from ?? txs[0]?.date ?? to;
  // We query the fxrates at 4pm (end-of-day) or now, if day is today.
  const eod = from.setZone(MarketTZ).set({
    hour: 16,
    minute: 0,
    second: 0,
    millisecond: 0,
  })
  // offset to EOD today (may be in the future)
  const eodOffset = eod.diff(from);
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
  toHuman(txs.reduce((tot, tx) => tot + fiatChange(tx, fxRates), 0), true);

export function getAccountSerie(data: GraphHistoryProps, rates: FXRate[], ratesApi?: IFxRates) {
  const { from, to, eodOffset } = getDateVals(data);
  const { txs } = data;
  const numDays = to.diff(from).as("days");
  let balance = getInitialBalance(data);
  const initCostBasis = getChangeInFiat(txs.filter(tx => tx.date < from), rates);
  let costBasis = initCostBasis;

  // day-to-day value
  const accountValuesDatum: TxDatum[] = [];
  // fiat cost: cost of the current account
  //let costBasisDatum: Datum[] = [];
  for (let i = 0; i < numDays; i++) {
    const date = from.plus({ days: i });
    // any transactions this day?
    const daysTxs = txs.filter(tx => tx.date.toISODate() === date.toISODate());

    // update balance to the last balance of the day
    balance = lastItem(daysTxs)?.balance ?? balance;
    costBasis += getChangeInFiat(daysTxs, rates);
    // Get the days FX rate at EOD (or now, if EOD is in the future)
    // We do not offset date itself, because we want it to be
    // in the same timezone of the input date (which we assume is the users tz)
    let eod = date.plus(eodOffset).toJSDate();
    if (eod.getTime() > Date.now())
      eod = new Date();

    // If not already present, fetch this rate
    ratesApi?.fetchRateAtDate(eod)
    // For each plugin, apply it's effect to the result
    const timestamp = DateTime.fromJSDate(eod);
    const balanceMod = data.plugins.reduce((bal, plugin) => plugin(bal, timestamp, rates), new Decimal(balance))

    const exRate = weSellAt(rates, eod);
    const finalFiat = toHumanDecimal(balanceMod.mul(exRate));
    const rawFiat = toHumanDecimal(new Decimal(balance).mul(exRate));
    accountValuesDatum.push({
      x: date.toISODate(),
      y: finalFiat.toNumber(),
      raw: rawFiat.toNumber(),
      costBasis,
      txs: daysTxs,
    })

  }

  // ensure we have an opening entry on cost basis
  return accountValuesDatum;
}

function lastItem<T>(arr: T[]): T { return arr[arr.length - 1] }
