import { parse } from 'papaparse';
import { DateTime } from 'luxon';
import { FDRNewDeal, getIdx, MarketData } from './market';
import { Decimal } from 'decimal.js-light';

function transformDate(value: string) {
  return DateTime.fromFormat(value, "yyyy-MM", {
    zone: "America/New_York"
  });
}

const transformData = (value: string, name: string) =>
  (name === 'Date') && value.length ?
    transformDate(value) :
    value ? new Decimal(value) : value;

export function parseData(data: string) {
  // Strip leading/trailing empty strings
  const csv = parse(data.trim(), {
    header: true,
    transform: transformData,
  });

  return csv.data as MarketData[];
}

export async function getData() {
  const data = await fetch('/sp500_monthly.csv');
  const text = await data.text();
  const r = parseData(text);
  // Only return history since New Deal.
  // Sim takes forever otherwise.
  return r.slice(getIdx(FDRNewDeal, r));
}

