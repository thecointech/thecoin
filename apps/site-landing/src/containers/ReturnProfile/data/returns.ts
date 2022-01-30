import { MarketData } from './market';
import { SimulationParameters } from './params';
import { ReturnSimulator } from './simulator';
import { SimulationState } from './state';

export type CoinReturns = {
  lowerBound: number;
  upperBound: number;
  mean: number;
  median: number;
  values: number[];
}

// Run a simulation for every month in data
// with maximum duration of maxSimulationMonths
export function calcAllReturns(data: MarketData[], params: SimulationParameters) {

  // For each period of length monthCount, find the total return
  const simulator = new ReturnSimulator(data, params);
  const periods = [];

  let start = data[0].Date;
  let last = data[data.length - 1].Date;
  while (start < last) {
    const p = simulator.calcReturns(start);
    periods.push(p);
    start = start.plus({months: 1});
  }
  return periods;
}

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
