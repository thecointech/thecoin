import { fetchRate, FXRate, weBuyAt, weSellAt } from "@thecointech/fx-rates";
import { toHuman } from "@thecointech/utilities";
import { nextOpenTimestamp } from "@thecointech/market-status";
import { DateTime } from 'luxon';
import { ReconciledRecord } from "./types";
import { Decimal } from 'decimal.js-light';

const getSettlementDate = async (r: ReconciledRecord) =>
  DateTime.fromMillis(await nextOpenTimestamp(r.data.initiated));

const rates: FXRate[] = [];

function haveRateFor(ts: number): boolean {
  return rates.find(r => r.validFrom <= ts && r.validTill > ts) != null;
}

const updateRate = async (date: DateTime) => {
  if (!haveRateFor(date.toMillis())) {
    const newRate = await fetchRate(date.toJSDate());
    if (!newRate)
      throw new Error('uhoh');
    rates.push(newRate);
    rates.sort((a, b) => a.validFrom - b.validFrom)
  }
}

export async function fetchFiat(coin: Decimal, action: string, date: DateTime) {
  await updateRate(date);
  return new Decimal(
    toHuman(coin.toNumber() * (
      action === "Buy"
        ? weSellAt(rates, date.toJSDate())
        : weBuyAt(rates, date.toJSDate())
      )
    , true)
  )
}
export const getFiat = async (r: ReconciledRecord) =>
  r.data.fiat || fetchFiat(r.data.coin!, r.data.type, await getSettlementDate(r));

