import Papa from 'papaparse';
import { DateTime } from 'luxon';
import { MarketData } from './market';

function transformDate(value: string) {
  return DateTime.fromFormat(value, "yyyy-MM", {
    zone: "America/New_York"
  });
}

const transformData = (value: string, name: string) =>
  (name === 'Date') && value.length ?
    transformDate(value) :
    Number(value);

export function parseData(data: string) {
  // Strip leading/trailing empty strings
  const csv = Papa.parse(data.trim(), {
    header: true,
    transform: transformData,
  });

  return csv.data as MarketData[];
}

export async function getData() {
  const data = await fetch('/sp500_monthly.csv');
  const text = await data.text();
  return parseData(text);
}

