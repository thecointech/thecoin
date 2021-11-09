import { ActionDictionary } from "@thecointech/broker-db";
import { Decimal } from 'decimal.js-light';
import { DateTime } from 'luxon';
import { existsSync, readFileSync } from 'fs';

type AllActions = {
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

export const cacheFile = __dirname + '/prod.json';
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
