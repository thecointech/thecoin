import { first, last } from '@thecointech/utilities/ArrayExtns'
import { MarketData } from './market';
import { SimulationParameters } from './params';
import { ReturnSimulator } from './simulator';
import { SimulationState, calcFiat } from './state';

export type CoinReturns = {
  lowerBound: number;
  upperBound: number;
  mean: number;
  median: number;
  // Array of all the simulation results that made up this thingy
  values: SimulationState[];
}

// Run a simulation for every month in data
// with maximum duration of maxSimulationMonths
// NOTE: This does NOT limit results, it will
// calculate _all_ returns, including returns
// of just 1 month.
export function calcAllReturns(data: MarketData[], params: SimulationParameters) {

  // For each period of length monthCount, find the total return
  const simulator = new ReturnSimulator(data, params);
  const r: SimulationState[][] = [];

  let start = data[0].Date;
  let last = data[data.length - 1].Date;
  while (start < last) {
    if (start.month == 1 && start.day == 1) {
      console.log(`Processed ${r.length}: ${start.toSQLDate()}`);
    }
    const p = simulator.calcReturns(start);
    r.push(p);
    start = start.plus({months: 1});
  }
  return r;
}

function longestSimWeeks(allReturns: SimulationState[][]) {
  const longestReturn = allReturns[0];
  const start = first(longestReturn);
  const end = last(longestReturn);
  return end.date.diff(start.date, "weeks").weeks;

}

// For each duration (1 thru max simulation duration) find the average return & percentiles.
// Data is array of simulations
export function calculateAvgAndArea(allReturns: SimulationState[][], data: MarketData[], percentile: number) {
  const toFiat = (s: SimulationState) => calcFiat(s, data).toNumber();
  const maxLength = longestSimWeeks(allReturns);
  const r: CoinReturns[] = [];
  for (let weeks = 1; weeks < maxLength; weeks++) {
    const returnsAfterWeeks = allReturns.map(r => r[weeks]).filter(r => !!r);
    returnsAfterWeeks.sort((a, b) => toFiat(a) - toFiat(b));
    const fiatValue = returnsAfterWeeks.map(toFiat);

    const sum = fiatValue.reduce((acc,val) => acc + val, 0);
    const midIndex = fiatValue.length / 2;
    const lowerBoundIdx = midIndex - midIndex * percentile;
    const upperBoundIdx = midIndex - 1 + midIndex * percentile;
    r.push({
      mean: sum / fiatValue.length,
      median: fiatValue[Math.round(midIndex)],
      lowerBound: fiatValue[Math.floor(lowerBoundIdx)],
      upperBound: fiatValue[Math.round(upperBoundIdx)],
      values: returnsAfterWeeks
    });
  };
  return r;
}
