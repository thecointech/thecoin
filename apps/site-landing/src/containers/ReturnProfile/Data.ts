import Papa from 'papaparse';

// US abandoned gold standard in April 1933
export const FDRNewDeal = new Date(1933, 3);

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


export type CoinReturns = {
  lowerBound: number;
  upperBound: number;
  mean: number;
  median: number;
  values: number[];
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

  return csv.data as DataFormat[];
}

export async function getData() {
  const data = await fetch('/sp500_monthly.csv');
  const text = await data.text();
  return parseData(text);
}

///////////////////////////////////

export function calcReturns(startIdx: number, endIdx: number, data: DataFormat[], _maxFee: number) {
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

// Calculates an array of every possible period of length monthCount in between start and end
// Note - start and end are inclusive, because when calculating return for month 0, we don't know
// what it is until month 1
export function calcPeriodReturn(data: DataFormat[], startDate: Date, endDate: Date, monthCount: number, fee: number) {
  const start = getIdx(startDate, data);
  let end = getIdx(endDate, data);
  // Do not read past the end of the array
  end = Math.min(end, data.length - 1);
  // The number of periods available between max-min
  // In a year, we have 12 periods of size 1.
  // (we subtract 1 from monthCount here because this actually
  // means we count from jan->jan)
  const numDatum = end - start - (monthCount - 1);
  if (numDatum <= 0) {
    return [];
  }

  // For each period of length monthCount, find the total return
  const periods: number[] = Array(numDatum);
  for (let i = 0; i < numDatum; i++) {
    const s = i + start;
    periods[i] = calcReturns(s, s + monthCount, data, fee);
  }
  return periods;
}

export function getAllReturns(data: DataFormat[], maxMonths: number, fee: number)
{
  // We only want to count the data since FDR's "new deal"
  const startDate = FDRNewDeal;
  // Include all the most recent data (todo: update that CSV)
  const endDate = new Date();

  // we generate from 1 month through till 60 years
  const minMonths = 1;
  const allReturns: number[][] = new Array(maxMonths);

  for (let monthCount = minMonths; monthCount <= maxMonths; monthCount++)
  {
    const periodReturns = calcPeriodReturn(data, startDate, endDate, monthCount, fee);
    allReturns[monthCount - 1] = periodReturns;
  }
  return allReturns.map(returns => {
    return returns.sort((a, b) => a - b);
  });
}

export function calculateAvgAndArea(allReturns: number[][], percentile: number)
{
  return allReturns.map(returns => {
    let sum = 0;
    for (let i = 0; i < returns.length; i++) {
      sum += returns[i];
    }
    const midIndex = returns.length / 2;
    const lowerBoundIdx = midIndex - midIndex * percentile;
    const upperBoundIdx = midIndex - 1 + midIndex * percentile;
    const r: CoinReturns = {
      mean: sum / returns.length,
      median: returns[Math.round(midIndex)],
      lowerBound: returns[Math.round(lowerBoundIdx)],
      upperBound: returns[Math.round(upperBoundIdx)],
      values: returns
    };
    return r;
  });
}

// // export function arrayMin(arr: number[]) {
// //   let len = arr.length;
// //   let min = Infinity;
// //   while (len--) {
// //     if (arr[len] < min) {
// //       min = arr[len];
// //     }
// //   }
// //   return min;
// // }

// // export function arrayMax(arr: number[]) {
// //   let len = arr.length;
// //   let max = -Infinity;
// //   while (len--) {
// //     if (arr[len] > max) {
// //       max = arr[len];
// //     }
// //   }
// //   return max;
// // }

// // export function calcBucketShape(minValue: number, maxValue: number, numBuckets: number) {
// //   const spread = maxValue - minValue;

// //   // what would even buckets look like?
// //   const minBucketSize = spread / numBuckets;
// //   const roundBucketSizes = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 30, 50, 100, 200];
// //   const bucketSize = roundBucketSizes.find(v => v > minBucketSize) || roundBucketSizes[roundBucketSizes.length - 1];

// //   // calculate round bucket size for min/max
// //   const minBucket = Math.floor(minValue / bucketSize) * bucketSize;
// //   const maxBucket = Math.ceil(maxValue / bucketSize) * bucketSize;
// //   return {
// //     min: minBucket,
// //     max: maxBucket,
// //     size: bucketSize,
// //   };
// // }


// // export const CalcIndex = (min: number, max: number, v: number, count: number) =>
// //   Math.ceil(count * (v - min) / (max - min));

// // export function bucketValues(values: number[], numBuckets: number, startingValue?: number): CoinReturns {
// //   const minValue = (startingValue === undefined) ? arrayMin(values) : startingValue;
// //   const maxValue = arrayMax(values);

// //   // Spread
// //   const { min, max, size } = calcBucketShape(minValue, maxValue, numBuckets);

// //   const count = Math.round((max - min) / size);
// //   const bucketCount = Math.max(count + 1, numBuckets);
// //   const buckets: number[] = Array(bucketCount).fill(0);
// //   let total = 0;
// //   for (const v of values) {
// //     const idx = CalcIndex(min, max, v, count);
// //     buckets[idx] = buckets[idx] + 1;
// //     total += v;
// //   }
// //   const mean = total / values.length;

// //   return {
// //     min,
// //     max,
// //     size,
// //     mean,
// //     values: buckets,
// //     count: values.length,
// //   };
// // }

// //
// // This function calculates a 2D array of all possible returns for
// // a range of months from 1 to maxNumMonths
// //
// export function calcPlotData(maximumNumMonths: number, data: DataFormat[]): number[][] {
//   if (data.length === 0 || !maximumNumMonths) {
//     return [];
//   }

//   const startDate = new Date(1932, 0);

//   return range(1, maximumNumMonths)
//     .map(numMonths => calcPeriodReturn(data, startDate, new Date(), numMonths, 0))
// }

// // export function calcMinMaxmean(data: number[][]) : CoinReturns[] {
// //   return data.map(forMonthX => {
// //     const orderedValues = forMonthX.sort();
// //     const nVals = orderedValues.length;
// //     return {
// //       min: orderedValues[0],
// //       max: orderedValues[nVals - 1],
// //       mean: orderedValues.reduce((total, val) => total + val) / nVals,
// //       // The following 3 values don't really make sense in this context;
// //       size: nVals,
// //       values: orderedValues,
// //       count: nVals
// //     }
// //   });
// // }

// function calcBucketData(_maximumNumMonths: number, _data: DataFormat[], _minimum?: number) : CoinReturns {
//   throw new Error("fixme");
// }

// export const GetPlotData = memoize(calcBucketData, (m: number, d: DataFormat[]) => d.length + m);

// export const CalcmeanReturn = (multiplier: number, mean: number) =>
//   (multiplier * (1 + mean)).toFixed(2);

// export const CalcRoundedmeanReturn = (multiplier: number, data: CoinReturns) =>
//   (multiplier * (1 + Math.round(data.mean / data.size) * data.size)).toFixed(2);
