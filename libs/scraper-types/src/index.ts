import type currency from 'currency.js';
import type { DateTime } from 'luxon';

export type * from "./eventTypes";
export type * from "./searchTypes";
export type * from "./elementDataType";

export type HistoryRow = {
  date: DateTime;
  values: (currency | undefined)[];
}

export type ReplayValue = string | DateTime | currency | HistoryRow[]

// Generic result - outer key is section name, inner key is field name
export type ReplayResult = Record<string, Record<string, ReplayValue>>

// Bounds we searched within the page
export type Bounds = {width: number, height: number};

