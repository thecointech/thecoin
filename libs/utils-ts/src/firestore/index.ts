import { Firestore, Timestamp } from "@the-coin/types/FirebaseFirestore";
import { CertifiedTransfer } from "@the-coin/types";
export { init } from "./init";

// Store on global to avoid any weirdities
// from importing modules
global.__thecoin = {
  firestore: null
}

export function SetFirestore(db: Firestore)
{
  global.__thecoin.firestore = db;
}


export function GetFirestore() : Firestore
{
  if (!global.__thecoin.firestore)
    throw new Error("Firestore not initialized");
  return global.__thecoin.firestore;
}

export type ProcessRecord = {
  recievedTimestamp: Timestamp,
  processedTimestamp?: Timestamp,
  completedTimestamp?: Timestamp,
  hash: string,
  hashRefund?: string,
  confirmed: boolean,
  fiatDisbursed: number
  confirmation?: number;
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
