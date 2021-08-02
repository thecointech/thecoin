export * from './utils';
export * from './CurrencyCodes';

import type { fetchRate as srcFetch } from "./fetch";

export const fetchRate: typeof srcFetch = async (date) => {
  var now = date?.getTime() ?? Date.now();
  return {
    target: 124,
    buy: 1,
    sell: 2,
    fxRate: 3,
    validFrom: now,
    validTill: now + 360000,
  }
};
