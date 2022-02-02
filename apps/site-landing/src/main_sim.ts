// import { readFileSync } from 'fs';
// import { join } from 'path';
import { first } from '@thecointech/utilities/ArrayExtns';
import { calcAllReturns, calcFiat, createParams, parseData, SimulationState } from './containers/ReturnProfile/data';
import { basicParams, generateData } from './containers/ReturnProfile/data/data.test';
import { ReturnSimulator } from './containers/ReturnProfile/data/simulator';

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

const data = generateData()
const params = createParams({
  ...basicParams,
  shockAbsorber: {
    // We protect up to $500
    maximumProtected: 500,
    // for a max drop of 50%
    absorbed: 0.50,
    // Using up to 6% of profit
    cushionPercentage: 0.06,
  }
});

const simulator = new ReturnSimulator(data, params);
const run1 = simulator.calcReturns(first(data).Date);

const toProfit = (s: SimulationState) => calcFiat(s, data).sub(s.credit.current).sub(s.credit.balanceDue).toNumber();
const profits1 = run1.map(toProfit);
console.log(profits1);
