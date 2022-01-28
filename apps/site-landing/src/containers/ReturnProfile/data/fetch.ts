import Papa from 'papaparse';
import { DateTime } from 'luxon';
import { DataFormat } from './types';

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

  return csv.data as DataFormat[];
}

export async function getData() {
  const data = await fetch('/sp500_monthly.csv');
  const text = await data.text();
  return parseData(text);
}

export function getIdx(date: DateTime, data: DataFormat[]) {
  const initDate = data[0].Date;
  const yearIdx = (date.year - initDate.year) * 12;
  const monthIdx = date.month - 1;
  return Math.min(yearIdx + monthIdx, data.length);
}
