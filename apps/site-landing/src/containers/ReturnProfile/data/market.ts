import { DateTime } from 'luxon';
import { doThrow } from '@thecointech/utilities/IsDebug';

export type MarketData = {
  Date: DateTime;
  P: number;
  D: number;
  E: number;
}

// US abandoned gold standard in April 1933
export const FDRNewDeal = DateTime.fromObject({year: 1933, month: 3});

export function getIdx(date: DateTime, data: MarketData[]) {
  const initDate = data[0].Date;
  const yearIdx = (date.year - initDate.year) * 12;
  const monthIdx = date.month - 1;
  return yearIdx + monthIdx;
}

export const getMarketData = (date: DateTime, data: MarketData[]) : MarketData|undefined =>
  data[getIdx(date, data)] ?? doThrow("Invalid index");
