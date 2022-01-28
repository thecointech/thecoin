import { SimulationState } from '.';
import { ReturnSimulator } from './simulator';
import { DataFormat, SimulationParameters } from './types';

// Run a simulation for every month in data
// with maximum duration of maxSimulationMonths
export function calcAllReturns(data: DataFormat[], maxSimulationMonths: number, params: SimulationParameters) {

  // For each period of length monthCount, find the total return
  const simulator = new ReturnSimulator(data, params);
  const periods = [];

  let start = data[0].Date;
  let last = data[data.length - 1].Date;
  while (start < last) {
    const end = start.plus({months: maxSimulationMonths});
    const p = simulator.calcReturns(start, end);
    periods.push(p);
    start = start.plus({months: 1});
  }
  return periods;
}

// export function getAllReturns(data: DataFormat[], maxMonths: number, params: SimulationParameters) {
//   // we generate from 1 month through till 60 years
//   const minMonths = 1;
//   const allReturns = [];

//   for (let months = minMonths; months <= maxMonths; months++) {
//     const periodReturns = calcPeriodReturn(data, months, params);
//     allReturns[months - 1] = periodReturns;
//   }
//   // Sort each period from least return to most return
//   // TODO: value should be in fiat (not coin)
//   const finalValue= (a: SimulationState[]) => a[a.length - 1].coin.toNumber();
//   return allReturns.map(returns => {
//     return returns.sort((a, b) => finalValue(a) - finalValue(b));
//   });
// }

// For each duration (1 thru max simulation duration) find the average return & percentiles.
// Data is array of simulations
export function calculateAvgAndArea(allReturns: SimulationState[][], percentile: number) {
  const longestReturn = allReturns[0];
  const maxLength = longestReturn[0].date.diff(longestReturn[longestReturn.length - 1].date).months;

  const toValue = (s: SimulationState) => s.coin.toNumber();
  const r = [];
  for (let months = 1; months < maxLength; months++) {
    const allResultsAtMonth = allReturns.map(r => r[months]);
    const returns = allResultsAtMonth.map(toValue).sort();
    const sum = returns.reduce((a,b) => a + b, 0);

    const midIndex = returns.length / 2;
    const lowerBoundIdx = midIndex - midIndex * percentile;
    const upperBoundIdx = midIndex - 1 + midIndex * percentile;
    r.push({
      mean: sum / returns.length,
      median: returns[Math.round(midIndex)],
      lowerBound: returns[Math.round(lowerBoundIdx)],
      upperBound: returns[Math.round(upperBoundIdx)],
      values: returns
    });
  };
  return r;
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
