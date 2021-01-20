import { fetchRate, FXRate, weBuyAt, weSellAt } from "@the-coin/shared/containers/FxRate";
import { toHuman } from "@the-coin/utilities";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import { ReconciledRecord } from "types";

const getSettlementDate = async (r: ReconciledRecord) =>
r.data.processedTimestamp?.toDate() ??
new Date(await NextOpenTimestamp(r.data.recievedTimestamp.toDate()));

const rates: FXRate[] = [];

function haveRateFor(ts: number): boolean {
  return rates.find(r => r.validFrom <= ts && r.validTill > ts) != null;
}

const updateRate = async (date: Date) => {
  if (!haveRateFor(date.getTime())) {
    const newRate = await fetchRate(date);
    if (!newRate)
      throw new Error('uhoh');
    rates.push(newRate);
    rates.sort((a, b) => a.validFrom - b.validFrom)
  }
}

async function fetchFiat(coin: number, action: string, date: Date) {
  await updateRate(date);
  return toHuman(coin * (
    action == "Buy"
      ? weSellAt(rates, date)
      : weBuyAt(rates, date)
    )
  , true)
}
export const getFiat = async (r: ReconciledRecord) =>
  r.data.fiatDisbursed || fetchFiat(r.data.transfer.value, r.action, await getSettlementDate(r));

