import type currency from 'currency.js';
import type { DateTime } from 'luxon';

export type * from "./eventTypes";
export type * from "./searchTypes";
export type * from "./elementDataType";

export type HistoryRow = {
  date: DateTime;
  values: (currency | undefined)[];
}

// Generic result encompasses all of the above
export type ReplayResult = Record<string, string | DateTime | currency | HistoryRow[]>

// Bounds we searched within the page
export type Bounds = {width: number, height: number};

