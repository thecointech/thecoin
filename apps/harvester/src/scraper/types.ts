import type currency from 'currency.js';
import type { DateTime } from 'luxon';
import type { HistoryRow } from './table';

export type ActionTypes = 'visaBalance'|'chqBalance'|'chqETransfer';

export type VisaBalanceResult = {
  balance: currency;
  dueDate: DateTime;
  dueAmount: currency;
  history: HistoryRow[];
}

export type ChequeBalanceResult = {
  balance: currency;
}

export type ETransferResult = {
  confirm: string,
}

// Generic result encompasses all of the above
export type ReplayResult = Record<string, string|currency|DateTime>;

export type ValueType = "date"|"currency"|"text"|"table";

export type ValueParsing = {
  type: ValueType,
  format: string|null,
}
export type ValueResult = {
  text: string,
  parsing: ValueParsing,
}

export type BaseEvent = {
  timestamp: number,
}

export type Coords = {
  top: number,
  left: number,
  height: number,
  width: number,
}
export type Font = {
  font: string,
  color: string,
  size: string,
  style: string,
}
export type ElementData = {
  // The frames to dereference on our way to the data
  frame?: string
  tagName: string,
  selector: string,
  coords: Coords,
  text: string,
  font?: Font,
  siblingText?: string[],
}

export type NavigationEvent = BaseEvent & {
  type: "navigation",
  to: string,
};

export type LoadEvent = BaseEvent & {
  type: "load",
} & BaseEvent;


export type UnloadEvent = {
  type: "unload",
} & BaseEvent;



export type ClickEvent = {
  type: "click",
  clickX: number,
  clickY: number,
  // font: Font,
  // text: string,
} & BaseEvent & ElementData;

export type InputEvent = {
  type: "input",
  dynamicName?: string,
  value?: string,
  hitEnter?: boolean,
  valueChange?: boolean,
} & BaseEvent & ElementData;

// Not really an event, but something to read later
export type ValueEvent = {
  type: "value",
  font: Font,
  name?: string,
  parsing?: ValueParsing
} & BaseEvent & ElementData;


export type AnyEvent = NavigationEvent|ClickEvent|InputEvent|UnloadEvent|LoadEvent|ValueEvent;
