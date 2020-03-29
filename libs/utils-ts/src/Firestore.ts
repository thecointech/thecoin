import { Firestore, Timestamp } from "@the-coin/types/FirebaseFirestore";
import { CertifiedTransfer } from "@the-coin/types";

let __firestore: Firestore|null = null;

export function SetFirestore(db: Firestore)
{
  __firestore = db;
}


export function GetFirestore()
{
  if (!__firestore)
    throw new Error("Firestore not initialized");
  return __firestore;
}

export type ProcessRecord = {
  recievedTimestamp: Timestamp,
  processedTimestamp?: Timestamp,
  completedTimestamp?: Timestamp,
  hash: string,
  confirmed: boolean,
  fiatDisbursed: number
}

export type CertifiedTransferRecord = CertifiedTransfer & ProcessRecord;

export function isDate(d: Timestamp|Date) : d is Date {
  return (d as Date).getFullYear != undefined;
}
export function isTimestamp(d: Timestamp|Date) : d is Timestamp {
  return (d as Timestamp).nanoseconds != undefined;
}

export function AsDate(d: Timestamp|Date) : Date {
  if (isDate(d))
    return d;
  else return d.toDate();
}
