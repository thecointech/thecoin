import { Timestamp } from "@thecointech/firestore";
import { DateTime } from "luxon"
import { Reconciliations } from "./types";

export const compareByDate = <K extends PropertyKey>(key: K) =>
  (l: Record<K, DateTime>, r: Record<K, DateTime>) => l[key].toMillis() - r[key].toMillis();

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

export const getOrCreateUser = (users: Reconciliations, address: string) => {
  let user = users.find(u => u.address === address);
  if (user === undefined) {
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
    const src = data.find(d => d.address === record.address);
    if (!src) data.push(record);
    else {
      const srcIds = src.transactions.map(tx => tx.data.id);
      const unique = record.transactions.filter(tx => !srcIds.includes(tx.data.id));
      src.transactions.push(...unique);
    }
  }
}
