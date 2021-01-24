import { Timestamp } from "@the-coin/types";
import { DateTime } from "luxon"
import { Reconciliations } from "./types";
import { knownIssues } from './data/manual.json';

export const compareByClosestTo = <K extends PropertyKey>(key: K, date: DateTime) =>
  (l: Record<K, DateTime>, r: Record<K, DateTime>) =>
    Math.abs(l[key].diff(date).milliseconds) - Math.abs(r[key].diff(date).milliseconds)

export const lessThanDaysDiff = <K extends PropertyKey>(key: K, date: DateTime, maxDays: number) =>
    (r: Record<K, DateTime>) =>
      Math.abs(r[key].diff(date, "days").days) <= maxDays

export const filterCandidates = <K extends PropertyKey, T extends Record<K, DateTime>>(data: T[], key: K, date: DateTime, maxDays: number) => {
  const sorted = [...data].sort(compareByClosestTo(key, date));
  return sorted.filter(lessThanDaysDiff(key, date, maxDays));
}

export function toDateTime(ts: Timestamp) : DateTime;
export function toDateTime(ts: Timestamp|undefined) : DateTime|undefined;
  export function toDateTime(ts?: Timestamp) {
  return ts
    ? DateTime.fromMillis(ts.toMillis())
    : undefined;
}

// export function toDstArray<T>(src: T[], dst: T[], item?: T) {
//   if (item) {
//     src.splice(src.indexOf(item), 1);
//     dst.push(item);
//     return true;
//   }
//   return false;
// }

export const getOrCreateUser = (users: Reconciliations, address: string) => {
  let user = users.find(u => u.address === address);
  if (user == undefined) {
    console.warn("No user found for address: " + address);
    user = {
      names: [],
      address,
      transactions: [],
    };
    users.push(user);
  }
  return user;
}

export function addReconciled(data: Reconciliations, more: Reconciliations) {
  for (const record of more) {
    const src = data.find(d => d.address == record.address);

    // any invalid hashes?
    record.transactions
      .filter(tx => !tx.data.hash.startsWith("0x"))
      .filter(tx => !knownIssues.find(ki => ki.hash == tx.data.hash))
      .forEach(tx => {
        console.error("Invalid hash here: " + tx.data.hash);
      });

    if (!src) data.push(record);
    else {
      const srcHashes = src.transactions.map(tx => tx.data.hash);
      const unique = record.transactions.filter(tx => !srcHashes.includes(tx.data.hash));
      src.transactions.push(...unique);
      //src.transactions.sort((l, r) => l.data.recievedTimestamp.toMillis() - r.data.recievedTimestamp.toMillis())
    }
  }
}
