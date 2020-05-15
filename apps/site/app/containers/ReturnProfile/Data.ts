import Papa from 'papaparse';
import { memoize } from 'lodash';

export interface DataFormat {
  Date: Date;
  P: number;
  D: number;
  E: number;
  CPI: number;
  Fraction: number;
  RateGS10: number;
  Price: number;
  Dividend: number;
  Earnings: number;
  CAPE: string;
}

function transformDate(value: string) {
  const split = value.split('.');
  return new Date(Number(split[0]), Number(split[1]) - 1);
}

const transformData = (value: string, name: string) =>
  (name === 'Date') && value.length ?
    transformDate(value) :
    value;

export function parseData(data: string) {
  // Eliminate BOM data the stupid way
  const csv = Papa.parse(data, {
    dynamicTyping: true,
    header: true,
    transform: transformData,
  });
  // if (csv.errors.length > 0) {
  //   console.error(JSON.stringify(csv.errors));
  // }

  return csv.data as DataFormat[];
}

export async function getData() {
  const data = await fetch('/sp500_monthly.csv');
  //console.log(parseData(await data.text()))
  return parseData(await data.text());
}

///////////////////////////////////

export function calcReturns(startIdx: number, endIdx: number, data: DataFormat[]) {
  //console.log("FIX MAXFEE: " + maxFee);
  let shares = 1;
  for (let i = startIdx + 1; i <= endIdx; i++) {
    const month = data[i];
    // Get annualized dividend % for month
    const monthDiv = month.D / 12;
    // How many shares is this?
    const newShares = shares * monthDiv / month.P;
    // buy new shares with dividend
    shares = shares + newShares;
  }

  const firstMonth = data[startIdx];
  const lastMonth = data[endIdx];

  // const regularGains = 100 * ((lastMonth.P / firstMonth.P) - 1);
  return (Math.min(lastMonth.P * shares) / firstMonth.P) - 1;
}

export function getIdx(date: Date, data: any[]) {
  const initDate: Date = data[0].Date;
  const yearIdx = (date.getUTCFullYear() - initDate.getUTCFullYear()) * 12;
  const monthIdx = date.getUTCMonth();
  return Math.min(yearIdx + monthIdx, data.length);
}

export function calcPeriodReturn(data: DataFormat[], startDate: Date, endDate: Date, monthCount: number) {
  const start = getIdx(startDate, data);
  let end = getIdx(endDate, data);
  end = Math.min(end, data.length - monthCount);
  if (end <= start) {
    return [];
  }

  const numDatum = end - start;
  const periods = Array(numDatum);
  for (let i = 0; i < numDatum; i++) {
    const s = i + start;
    periods[i] = calcReturns(s, s + monthCount, data);
  }
  return periods;
}

export function arrayMin(arr: number[]) {
  let len = arr.length;
  let min = Infinity;
  while (len--) {
    if (arr[len] < min) {
      min = arr[len];
    }
  }
  return min;
}

export function arrayMax(arr: number[]) {
  let len = arr.length;
  let max = -Infinity;
  while (len--) {
    if (arr[len] > max) {
      max = arr[len];
    }
  }
  return max;
}

export function calcBucketShape(minValue: number, maxValue: number, numBuckets: number) {
  const spread = maxValue - minValue;

  // what would even buckets look like?
  const minBucketSize = spread / numBuckets;
  const roundBucketSizes = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 30, 50, 100, 200];
  const bucketSize = roundBucketSizes.find(v => v > minBucketSize) || roundBucketSizes[roundBucketSizes.length - 1];

  // calculate round bucket size for min/max
  const minBucket = Math.floor(minValue / bucketSize) * bucketSize;
  const maxBucket = Math.ceil(maxValue / bucketSize) * bucketSize;
  return {
    min: minBucket,
    max: maxBucket,
    size: bucketSize,
  };
}


export interface CoinReturns {
  min: number;
  max: number;
  size: number;
  average: number;
  values: number[];
  count: number;
  mins: number[];
  maxs: number[];
  // averageMarker: number;
  // averageLegend: string;
}

export const CalcIndex = (min: number, max: number, v: number, count: number) =>
  Math.ceil(count * (v - min) / (max - min));

export function bucketValues(values: number[], numBuckets: number, startingValue?: number): CoinReturns {
  const minValue = (startingValue === undefined) ? arrayMin(values) : startingValue;
  const maxValue = arrayMax(values);
  // Spread
  const { min, max, size } = calcBucketShape(minValue, maxValue, numBuckets);
  const count = Math.round((max - min) / size);
  const bucketCount = Math.max(count + 1, numBuckets);
  const buckets: number[] = Array(bucketCount).fill(0);
  let total = 0;
  for (const v of values) {
    const idx = CalcIndex(min, max, v, count);
    buckets[idx] = buckets[idx] + 1;
    total += v;
  }
  const average = total / values.length;

  return {
    min,
    max,
    size,
    average,
    values: buckets,
    count: values.length,
  };
}


export const NullData: CoinReturns = {
  values: [],
  average: 0,
  size: 1,
  min: 0,
  max: 0,
  count: 1,
};
//
export function CalcPlotData(monthCount: number, data: DataFormat[], minimumValue?: number): CoinReturns {
  if (data.length === 0 || !monthCount) {
    return NullData;
  }

  const startDate = new Date(1932, 0);
  const returns = calcPeriodReturn(data, startDate, new Date(), monthCount);
  return bucketValues(returns, 20, minimumValue);
}

export const GetPlotData = memoize(CalcPlotData, (m: number, d: DataFormat[]) => d.length + m);

export const CalcAverageReturn = (multiplier: number, average: number) =>
  (multiplier * (1 + average)).toFixed(2);

export const CalcRoundedAverageReturn = (multiplier: number, data: CoinReturns) =>
  (multiplier * (1 + Math.round(data.average / data.size) * data.size)).toFixed(2);