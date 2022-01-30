import { DateTime } from 'luxon';

export type MarketData = {
  Date: DateTime;
  P: number;
  D: number;
  E: number;
}

export function getIdx(date: DateTime, data: MarketData[]) {
  const initDate = data[0].Date;
  const yearIdx = (date.year - initDate.year) * 12;
  const monthIdx = date.month - 1;
  return yearIdx + monthIdx;
}

export const getMarketData = (date: DateTime, data: MarketData[]) : MarketData|undefined =>
  data[getIdx(date, data)]
