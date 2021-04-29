import { Timestamp } from "@thecointech/types";
export { init } from "./init";
export * from './timestamp';
export * from './firestore';
export { filterByEmulator } from "./debug";

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
