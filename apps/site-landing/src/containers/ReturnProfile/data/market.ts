import { DateTime } from 'luxon';
import { doThrow } from '@thecointech/utilities/IsDebug';
import { Decimal } from 'decimal.js-light';

export type MarketData = {
  Date: DateTime;
  P: Decimal;
  D: Decimal;
  E: Decimal;
}

// US abandoned gold standard in April 1933
export const FDRNewDeal = DateTime.fromObject({year: 1933, month: 3});

export function getIdx(date: DateTime, data: MarketData[]) {
  const initDate = data[0].Date;
  const yearIdx = (date.year - initDate.year) * 12;
  const monthIdx = date.month - initDate.month;
  return yearIdx + monthIdx;
}

export const getMarketData = (date: DateTime, data: MarketData[]): MarketData =>
  data[getIdx(date, data)] ?? doThrow("Invalid index");
