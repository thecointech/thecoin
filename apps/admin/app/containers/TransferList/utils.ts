import { FxRate } from "@the-coin/shared";
import { NextOpenTimestamp, toHuman, toCoin, GetActionDoc, GetActionRef, UserAction } from "@the-coin/utilities";
import { fromMillis, now } from "../../utils/Firebase";
import { TransferRecord } from "./types";
//import { FXRate } from "@the-coin/pricing";

export async function AddSettlementDate(record: TransferRecord, fxApi: FxRate.IFxRates) {
  const recievedAt = record.recievedTimestamp.toDate()
  const nextOpen = await NextOpenTimestamp(recievedAt);
  if (nextOpen < Date.now()) {
    fxApi.fetchRateAtDate(new Date(nextOpen));
  }
  record.processedTimestamp = fromMillis(nextOpen);
}

export function toFiat(record: TransferRecord, rates: FxRate.FXRate[]) {
  const processed = record.processedTimestamp;
  const fxDate = !processed || processed.toDate() > new Date() ? undefined : processed.toDate();
  const rate = FxRate.weBuyAt(rates, fxDate);
  return toHuman(rate * record.transfer.value, true);
}

export function calcCoin(record: TransferRecord, rates: FxRate.FXRate[]) {
  const processed = record.processedTimestamp;
  const fxDate = !processed || processed.toDate() > new Date() ? undefined : processed.toDate();
  const rate = FxRate.weSellAt(rates, fxDate);
  const i = FxRate.weBuyAt(rates, fxDate);
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
  record.completedTimestamp = now();
  await actionDoc.set(record);

  const ref = GetActionRef(actionType, record.hash);
  const deleteResults = await ref.delete();
  if (deleteResults && !deleteResults.writeTime) {
    throw new Error("I feel like something should happen here")
  }
}
