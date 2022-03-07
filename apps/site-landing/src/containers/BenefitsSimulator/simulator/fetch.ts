import { parse } from 'papaparse';
import { DateTime } from 'luxon';
import { FDRNewDeal, FxData, getIdx, MarketData, SnPData } from './market';
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

export function parseData<T>(data: string) {
  // Strip leading/trailing empty strings
  const csv = parse(data.trim(), {
    header: true,
    transform: transformData,
  });

  return csv.data as T[];
}

export async function fetchData<T>(name: string) {
  const data = await fetch(`/${name}`);
  const text = await data.text();
  return parseData<T>(text);
}

export async function fetchMarketData() {
  const snp = await fetchData<SnPData>('sp500_monthly.csv');
  const fx = await fetchData<FxData>('fx_monthly.csv');

  const getFxItem = (e: SnPData) => (
    // Fixed fx before 1950
    (e.Date < fx[0].Date)
      ? new Decimal(1.1)
      : fx[getIdx(e.Date, fx)].Fx
  );

  // Only return history since New Deal.
  // Sim takes forever otherwise.
  return snp
    .slice(getIdx(FDRNewDeal, snp))
    .map<MarketData>(e => ({
      ...e,
      Fx: getFxItem(e),
    }))
}
