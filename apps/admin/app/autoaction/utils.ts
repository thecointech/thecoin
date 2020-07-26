import { IFxRates, weBuyAt, weSellAt } from "@the-coin/shared/containers/FxRate";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import { TransferRecord } from "./types";
import { toHuman, toCoin } from "@the-coin/utilities";
import { GetActionDoc, GetActionRef, UserAction } from "@the-coin/utilities/User";
import { FXRate } from "@the-coin/pricing";
import { Timestamp } from "@the-coin/utilities/firestore";

export async function AddSettlementDate(record: TransferRecord, fxApi: IFxRates) {
  const recievedAt = record.recievedTimestamp.toDate()
  const nextOpen = await NextOpenTimestamp(recievedAt);
  if (nextOpen < Date.now()) {
    fxApi.fetchRateAtDate(new Date(nextOpen));
  }
  record.processedTimestamp = Timestamp.fromMillis(nextOpen);
}


export function toFiat<T extends TransferRecord>(record: T, rates: FXRate[])  {
  const processed = record.processedTimestamp;
  const fxDate = !processed || processed.toDate() > new Date() ? undefined : processed.toDate();
  const rate = weBuyAt(rates, fxDate);
  return toHuman(rate * record.transfer.value, true);
}

export function withFiat<T extends TransferRecord>(records: T[], rates: FXRate[]) : T[] {
  return records.map(r => ({
    ...r,
    fiatDisbursed: toFiat(r, rates)
  }))
}

export function calcCoin(record: TransferRecord, rates: FXRate[]) {
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
export async function MarkComplete(user: string, actionType: UserAction, record: TransferRecord) {

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
