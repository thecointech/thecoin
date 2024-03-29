import { first, isPresent, last } from '@thecointech/utilities/ArrayExtns'
import { DateTime } from 'luxon';
import { MarketData } from './market';
import { SimulationParameters } from './params';
import { ReturnSimulator } from './simulator';
import { SimulationState, netFiat } from './state';

export type CoinReturns = {
  week: number;
  lowerBound: number;
  upperBound: number;
  mean: number;
  median: number;
  // Array of all the simulation results that made up this thingy
  values: SimulationState[];
}

export type AllParams = {
  data: MarketData[],
  params: SimulationParameters,
  percentile?: number,
  cutoff?: number,
  increment?: number;
}

const defaultParams = {
  percentile: 1,
  cutoff: 3,
  increment: 3,
}
export function* calcAllResults(fullParams: AllParams) {

  const {data, params, percentile, cutoff, increment} = {
    ...defaultParams,
    ...fullParams,
  }

  // For each period of length monthCount, find the total return
  const simulator = new ReturnSimulator(data, params);

  let s = first(data).Date;
  let l = last(data).Date;
  const numSims = Math.floor(l.diff(s, "months").months / increment);
  // Start a simulation at each starting date.
  const startOffsets = [...Array(numSims).keys()].map((_, idx) => idx * increment);
  const sims = startOffsets.map(month => runSimAt(s.plus({month}), simulator));
  for (let week = 0; ; week++) {

    // Step the simulation
    const nthWeekResults = sims.map(gen => {
      const { value, done } = gen.next();
      return done ? null : value;
    });
    // Exit when we less than cutoff results left
    const filtered = nthWeekResults.filter(isPresent);
    if (filtered.length < cutoff) break;

    const avg = calculateAvgAndArea(filtered, percentile);
    yield {
      week,
      ...avg
    };
  }
}

export function calcAllResultsImmediate(fullParams: AllParams, numWeeks: number) {

  const all = calcAllResults(fullParams);
  const r: CoinReturns[] = [];
  for (let i = 0; i < numWeeks; i++) {
    const { value, done } = all.next();
    if (done || !value) break;
    r.push(value);
  }
  return r;
}

function* runSimAt(start: DateTime, simulator: ReturnSimulator) {
  let state = simulator.getInitial(start);
  const lastDate = last(simulator.data).Date;
  do {
    yield state;
    state = simulator.increment(start, state);
  } while(state.date <= lastDate);
}

function longestSimWeeks(allReturns: SimulationState[][]) {
  const longestReturn = allReturns[0];
  const start = first(longestReturn);
  const end = last(longestReturn);
  return end.date.diff(start.date, "weeks").weeks;
}

// For each duration (1 thru max simulation duration) find the average return & percentiles.
// Data is array of simulations
export function calculateAvgAndArea(allAtTimePassed: SimulationState[], percentile: number) {

  allAtTimePassed.sort((a, b) => netFiat(a) - netFiat(b));
  const fiatValue = allAtTimePassed.map(netFiat);

  const sum = fiatValue.reduce((acc,val) => acc + val, 0);
  const midIndex = fiatValue.length / 2;
  const lowerBoundIdx = midIndex - midIndex * percentile;
  const upperBoundIdx = midIndex - 1 + midIndex * percentile;
  return {
    mean: sum / fiatValue.length,
    median: fiatValue[Math.round(midIndex)],
    lowerBound: fiatValue[Math.floor(lowerBoundIdx)],
    upperBound: fiatValue[Math.round(upperBoundIdx)],
    values: allAtTimePassed
  };
}

// For each duration (1 thru max simulation duration) find the average return & percentiles.
// Data is array of simulations
export function calculateAvgAndAreaForAll(allReturns: SimulationState[][], percentile: number) {
  const maxLength = longestSimWeeks(allReturns);
  const r: CoinReturns[] = [];
  for (let week = 1; week < maxLength; week++) {
    const allAtWeek = allReturns.map(r => r[week]).filter(isPresent);
    r.push({
      week,
      ...calculateAvgAndArea(allAtWeek, percentile)
    });
  };
  return r;
}
