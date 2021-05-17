export {}
// import { fetchRate, FXRate, weBuyAt, weSellAt } from "@thecointech/shared/containers/FxRate";
// import { toHuman } from "@thecointech/utilities";
// import { NextOpenTimestamp } from "@thecointech/utilities/MarketStatus";
// import { DateTime } from 'luxon';
// import { ReconciledRecord } from "types";

// const getSettlementDate = async (r: ReconciledRecord) =>
//   r.action.processedTimestamp?.toDate() ??
//   DateTime.fromMillis(await NextOpenTimestamp(r.action.data.date.toJSDate()));

// const rates: FXRate[] = [];

// function haveRateFor(ts: number): boolean {
//   return rates.find(r => r.validFrom <= ts && r.validTill > ts) != null;
// }

// const updateRate = async (date: Date) => {
//   if (!haveRateFor(date.getTime())) {
//     const newRate = await fetchRate(date);
//     if (!newRate)
//       throw new Error('uhoh');
//     rates.push(newRate);
//     rates.sort((a, b) => a.validFrom - b.validFrom)
//   }
// }

// async function fetchFiat(coin: number, action: string, date: Date) {
//   await updateRate(date);
//   return toHuman(coin * (
//     action === "Buy"
//       ? weSellAt(rates, date)
//       : weBuyAt(rates, date)
//     )
//   , true)
// }
// export const getFiat = async (r: ReconciledRecord) =>
//   r.data.fiatDisbursed || fetchFiat(r.data.transfer.value, r.action, await getSettlementDate(r));

