// import { readFileSync } from 'fs';
// import { join } from 'path';
import { DateTime } from 'luxon';
import { createParams, MarketData, toFiat, zeroState } from '../src/containers/ReturnProfile/data';
import { basicParams } from '../src/containers/ReturnProfile/data/data.test';
import { zero } from '../src/containers/ReturnProfile/data/sim.decimal';
import { Decimal } from 'decimal.js-light';
import { applyShockAborber } from '../src/containers/ReturnProfile/data/sim.shockAbsorber';

// const sourceFilePath = join(__dirname, '/containers/ReturnProfile/data/sp500_monthly.csv');
// export function getData() {
//   const buffer = readFileSync(sourceFilePath);
//   return parseData(buffer.toString().slice(1));
// }

// const data = getData();
// console.time("calcReturns");
// const params = createParams({initialBalance: 100, maxDuration: {years: 10}});
// const allReturns = calcAllReturns(data.slice(data.length - 500), params, console.log);
// console.timeEnd("calcReturns")
// console.log('done: ' + allReturns?.length);

const start = DateTime.fromObject({ year: 2020 });
const params = createParams({
  ...basicParams,
  maxDuration: { years: 10 },
  shockAbsorber: {
    // for a max drop of 50%
    absorbed: 0.50,
    // Using up to 6% of profit
    cushionPercentage: 0.06,
  }
});
const market: MarketData = {
  Date: start,
  P: new Decimal(100),
  D: zero,
  E: zero,
};
const state = zeroState(start);
state.coin = new Decimal(100);
state.principal = toFiat(state.coin, market);
const principal = state.principal.toNumber();
params.shockAbsorber.maximumProtected = principal;

const runAbsorber = (price: number, expectedFiat: number) => {
  market.P = new Decimal(price);
  applyShockAborber(start, params, state, market);
  const currentFiat = toFiat(state.coin, market);
  if (!currentFiat.todp(2).eq(expectedFiat)) {
    debugger;
  }
}

// First run, nothing changes
runAbsorber(100, 10000);
// Market drops 10%
runAbsorber(90, 10000);
// Market drops another 10%
runAbsorber(80, 10000);
// Test slowly dropping past 50%
runAbsorber(51, 10000);
runAbsorber(50, 10000);
runAbsorber(49, 9800);
// Market drops all the way to 40%, now we should have lost 20%
runAbsorber(40, 8000);
// now it jumps back up to 80%
runAbsorber(80, 10000);

// Test run up
runAbsorber(98, 10000);
runAbsorber(100, 10000);
runAbsorber(104, 10000);
runAbsorber(106, 10000);
runAbsorber(108, 10200);
runAbsorber(110, 10400);

// before dropping all the way to 30%
runAbsorber(30, 6000);

// Test wild swings
runAbsorber(120, 11400);
runAbsorber(25, 5000);

// const simulator = new ReturnSimulator(data, params);
// const run1 = simulator.calcReturns(first(data).Date);

// const toProfit = (s: SimulationState) => calcFiat(s, data).sub(s.credit.current).sub(s.credit.balanceDue).toNumber();
// const profits1 = run1.map(toProfit);
// console.log(profits1);
