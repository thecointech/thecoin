import Papa from 'papaparse';

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
  return parseData(await data.text());
}

///////////////////////////////////

export function calcReturns(startIdx: number, endIdx: number, data: DataFormat[], maxFee: number) {
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

export function calcPeriodReturn(data: DataFormat[], startDate: Date, endDate: Date, monthCount: number, fee: number) {
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
    periods[i] = calcReturns(s, s + monthCount, data, fee);
  }
  return periods;
}

function arrayMin(arr) {
  let len = arr.length;
  let min = Infinity;
  while (len--) {
    if (arr[len] < min) {
      min = arr[len];
    }
  }
  return min;
}

function arrayMax(arr) {
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
  const roundBucketSizes = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10];
  const bucketSize = roundBucketSizes.find(v => v > minBucketSize) || 10;

  // calculate round bucket size for min/max
  const minBucket = Math.floor(minValue / bucketSize) * bucketSize;
  const maxBucket = Math.ceil(maxValue / bucketSize) * bucketSize;
  return {
    min: minBucket,
    max: maxBucket,
    size: bucketSize,
  };
}

export function bucketValues(values: number[], numBuckets: number) {
  const minValue = arrayMin(values);
  const maxValue = arrayMax(values);

  // Spread
  const { min, max, size } = calcBucketShape(minValue, maxValue, numBuckets);

  const count = Math.round((max - min) / size);
  const buckets: number[] = Array(numBuckets).fill(0);
  for (const v of values) {
    const r = (v - minValue) / (maxValue - minValue);
    const idx = Math.ceil(r * (count - 1));
    buckets[idx] = buckets[idx] + 1;
  }

  return {
    min,
    max,
    size,
    values: buckets,
  };
}
