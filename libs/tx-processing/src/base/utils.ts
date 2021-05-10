import { IFxRates, weBuyAt, weSellAt } from "@thecointech/shared/containers/FxRate";
import { NextOpenTimestamp } from "@thecointech/utilities/MarketStatus";
import { toHuman, toCoin } from "@thecointech/utilities";
import { GetActionDoc, GetActionRef, UserAction } from "@thecointech/utilities/User";
import { FXRate } from "@thecointech/pricing";
import { Timestamp } from "@thecointech/utilities/firestore";
import { BaseTransactionRecord } from "@thecointech/tx-firestore"

export async function AddSettlementDate(record: BaseTransactionRecord, fxApi: IFxRates) {
  const recievedAt = record.recievedTimestamp.toDate()
  const nextOpen = await NextOpenTimestamp(recievedAt);
  if (nextOpen < Date.now()) {
    const r = fxApi.fetchRateAtDate(new Date(nextOpen));
    if (r?.next)
      r.next();
  }
  record.processedTimestamp = Timestamp.fromMillis(nextOpen);
}


export function toFiat<T extends BaseTransactionRecord>(record: T, rates: FXRate[])  {
  const processed = record.processedTimestamp;
  const fxDate = !processed || processed.toDate() > new Date() ? undefined : processed.toDate();
  const rate = weBuyAt(rates, fxDate);
  return toHuman(rate * record.transfer.value, true);
}

export function withFiat<T extends BaseTransactionRecord>(records: T[], rates: FXRate[]) : T[] {
  return records.map(r => ({
    ...r,
    fiatDisbursed: toFiat(r, rates)
  }))
}

export function calcCoin(record: BaseTransactionRecord, rates: FXRate[]) {
  const processed = record.processedTimestamp;
  const fxDate = !processed || processed.toDate() > new Date() ? undefined : processed.toDate();
  const rate = weSellAt(rates, fxDate);
  const i = weBuyAt(rates, fxDate);
  if (i > rate) {
    console.error("Wait, what?")
  }
  return toCoin(record.fiatDisbursed / rate);
}

// Update DB with completion
export async function MarkComplete(user: string, actionType: UserAction, record: BaseTransactionRecord) {

  const actionDoc = GetActionDoc(user, actionType, record.hash);
  const action = await actionDoc.get();
  if (!action.exists)
    throw new Error("Oh No! You lost your AP");

  // Ensure we only complete once filling in the appropriate data
  if (!record.fiatDisbursed || !record.processedTimestamp)
    throw new Error("Missing required data: " + JSON.stringify(record));

  // Mark with the timestamp we finally finish this action
  record.completedTimestamp = Timestamp.now();
  await actionDoc.set(record);

  const ref = GetActionRef(actionType, record.hash);
  const deleteResults = await ref.delete();
  if (deleteResults && !deleteResults.writeTime) {
    throw new Error("I feel like something should happen here")
  }
}
