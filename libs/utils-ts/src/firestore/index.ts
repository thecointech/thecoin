import { CertifiedTransfer, Timestamp } from "@the-coin/types";
export { init } from "./init";
export * from './timestamp';
export * from './firestore';

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
