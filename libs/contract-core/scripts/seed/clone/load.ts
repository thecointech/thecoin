import { ActionDictionary } from "@thecointech/broker-db";
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import { existsSync, readFileSync } from 'fs';
import Papa from 'papaparse';
import { NormalizeAddress } from '@thecointech/utilities';

export const cacheFile = __dirname + '/prod.json';
export const mintFile = __dirname + '/mint.csv';
export type AllActions = {
  Buy: ActionDictionary<"Buy">;
  Sell: ActionDictionary<"Sell">;
  Bill: ActionDictionary<"Bill">;
}

const toDate = (obj: any, idx: string) => {
  if (obj[idx])
    obj[idx] = DateTime.fromISO(obj[idx]);
}
const toDecimal = (obj: any, idx: string) => {
  if (obj[idx])
    obj[idx] = new Decimal(obj[idx]);
}

function convertCommon(action: any) {
  toDate(action.data, "date");
  for (const delta of action.history) {
    toDate(delta, "created");
    toDate(delta, "date");
    toDecimal(delta, "fiat");
    toDecimal(delta, "coin");
  }
}

export function loadCurrent() {
  if (!existsSync(cacheFile))
    return null;

  const raw = readFileSync(cacheFile, 'utf8');
  const json = JSON.parse(raw);
  for (const actions of Object.values(json.Buy) as any[]) {
    for (const action of actions) {
      action.data.initial.amount = new Decimal(action.data.initial.amount);
      toDate(action.data, "date");
      convertCommon(action)
    }
  }
  for (const actions of Object.values(json.Sell) as any[]) {
    for (const action of actions) {
      convertCommon(action)
    }
  }
  for (const actions of Object.values(json.Bill) as any[]) {
    for (const action of actions) {
      convertCommon(action)
    }
  }
  return json as AllActions;
}

export type MintData = {
  originator: string,
  currency: "CAD"|"USD",
  date: DateTime,
  method: string,
  fiat: Decimal,
}

export function loadMinting() : MintData[]|undefined {
  if (!existsSync(mintFile))
    return undefined;

  const raw = readFileSync(mintFile, 'utf8');
  const csv = Papa.parse<MintData>(raw, {
    header: true,
    transform: transformData,
  });

  return csv.data.filter(row => row?.originator)
}

function transformData(value: string, name: string) {
  const v = value.trim();
  if (v.length != 0) {
    switch (name) {
      case "originator": return NormalizeAddress(v);
      case "date": return DateTime.fromSQL(v);
      case "fiat": return new Decimal(v);
    }
  }
  return v;
}
