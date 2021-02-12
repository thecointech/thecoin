import { Serie } from "@nivo/line";
import { FXRate } from "@the-coin/pricing";
import { Transaction } from "@the-coin/tx-blockchain";
import { toHuman } from "@the-coin/utilities";
import { fiatChange } from "../../containers/Account/profit";
import { useFxRates, useFxRatesApi, weSellAt } from "../../containers/FxRate";
import { DateTime } from "luxon";
import { GraphHistoryProps } from ".";
import { TxDatum } from "./types";

const getDateVals = ({ txs, from, to }: GraphHistoryProps) => {
  to = to ?? DateTime.local();
  from = from ?? txs[0].date;
  // We query the fxrates at 4pm (end-of-day) or now, if day is today.
  const eodOffset = {
    hours: 16 - from.setZone("America/New_York").get("hour")
  };
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


export function getAccountSerie(data: GraphHistoryProps): Serie[] {

  const {rates} = useFxRates();
  const ratesApi = useFxRatesApi();

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
    const daysTxs = txs.filter(tx => tx.date.toISODate() == date.toISODate());

    // update balance to the last balance of the day
    balance = lastItem(daysTxs)?.balance ?? balance;
    costBasis += getChangeInFiat(daysTxs, rates);
    // Get the days FX rate at EOD (or now, if EOD is in the future)
    // We do not offset date itself, because we want it to be
    // in the same timezone of the input date (which we assume is the users tz)
    const eod = date.plus(eodOffset).toJSDate();
    // If not already present, fetch this rate
    ratesApi.fetchRateAtDate(eod)
    const exRate = weSellAt(rates, eod);
    accountValuesDatum.push({
      x: date.toISODate(),
      y: toHuman(exRate * balance),
      costBasis,
      txs: daysTxs,
    })

  }

  // ensure we have an opening entry on cost basis
  return [
    {
      id: "AccountValue",
      data: accountValuesDatum
    },
  ]
}

function lastItem<T>(arr: T[]): T { return arr[arr.length - 1] }
