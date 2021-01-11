import { Timestamp } from "@the-coin/types/";
import { DateTime } from "luxon"

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
