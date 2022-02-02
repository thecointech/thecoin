import { last } from '@thecointech/utilities';
import { range } from 'lodash';
import { getData, getDate } from './fetch.test';
import { createParams } from './params';
import { ReturnSimulator } from './simulator';
import { calcFiat, SimulationState } from './state';

const data = getData();

const calcPercent = (state: SimulationState): number =>
  calcFiat(state, data)
    .sub(state.principal) // remove principal to leave profit
    .div(state.principal)
    .toNumber();
const simPercent = (r: SimulationState[]) =>
  calcPercent(r[r.length - 1]);
export const simIdxPercent = (idx: number, states: SimulationState[][]): number =>
  simPercent(states[idx]);

it('Should match basic calculation from DQYDJ', () => {
  // Note, because of our transition to using weekly-based calculations,
  // we no longer exactly match DQYDJ.  As it's not possible to get exact numbers
  // over a time period this long, neither calculation matches reality,
  // so we are just going to ignore this and move on.
  const params = createParams({
    initialBalance: 100,
  });
  const start = getDate(1959, 1);
  const end = start.plus(params.maxDuration);
  const simulator = new ReturnSimulator(data, params);
  const returns = simulator.calcReturns(start);

  // How many weeks passed?
  const elapsedWeeks = end.diff(start, "weeks").weeks;
  expect(returns.length).toBe(Math.ceil(elapsedWeeks) + 1);

  // Should match output here: https://dqydj.com/sp-500-return-calculator/
  const final = last(returns);
  const finalPercent = calcPercent(final);
  expect(finalPercent / 273.28238).toBeCloseTo(1); // Src: 27328.238%
});

it('accurately calculates for a single month', () => {
  // Ok - lets test getting % return over time
  const startDate = getDate(2010, 1);
  const params = createParams({initialBalance: 100, maxDuration: {months: 1}});
  const simulator = new ReturnSimulator(data, params);
  const returns = range(0, 12)
    .map(idx => simulator.calcReturns(startDate.plus({months: idx})));

  // Verify results vs a few sample numbers from https://dqydj.com/sp-500-return-calculator/

  expect(simIdxPercent(0, returns)).toBeCloseTo(-0.029);
  expect(simIdxPercent(2, returns)).toBeCloseTo(0.04088);
  expect(simIdxPercent(4, returns)).toBeCloseTo(-0.03543);
  expect(simIdxPercent(9, returns)).toBeCloseTo(0.02492);
  expect(simIdxPercent(11, returns)).toBeCloseTo(0.03464);
});

it('accurately caclulates for a 6 month period', () => {
  // There are a total of 7 6-month periods in a year.
  // Jan-Jul, Feb-Aug,... Jun-Dec, Jul-Jan
  const startDate = getDate(2010, 1);
  const params = createParams({initialBalance: 100, maxDuration: {months: 6}});
  const sim = new ReturnSimulator(data, params);
  const states = range(0, 7)
    .map(idx => sim.calcReturns(startDate.plus({months: idx})));

  expect(simIdxPercent(0, states)).toBeCloseTo(-0.02947);  // Jan => Jul
  expect(simIdxPercent(2, states)).toBeCloseTo(-0.01630);
  expect(simIdxPercent(5, states)).toBeCloseTo(0.15724);
  expect(simIdxPercent(6, states)).toBeCloseTo(0.19923); // Jul => Jan

  sim.params.maxDuration = {year: 1};
  const r = sim.calcReturns(startDate);
  expect(simPercent(r)).toBeCloseTo(0.16388);
})
