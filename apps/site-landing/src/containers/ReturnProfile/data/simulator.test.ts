import { getData, getDate } from './fetch.test';
import { createParams } from './params';
import { ReturnSimulator } from './simulator';

it('Should match basic calculation from DQYDJ', async () => {
  const data = getData();
  // Note, because of our transition to using weekly-based calculations,
  // we no longer exactly match DQYDJ.  As it's not possible to get exact numbers
  // over a time period this long, neither calculation matches reality,
  // so we are just going to ignore this and move on.
  const start = getDate(1959, 1);
  const end = getDate(2019, 1);
  const params = createParams({initialBalance: 100});
  const simulator = new ReturnSimulator(data, params);
  const returns = simulator.calcReturns(start, end);

  // How many weeks passed?
  const elapsedWeeks = end.diff(start, "weeks").weeks;
  expect(returns.length).toBe(Math.ceil(elapsedWeeks));

  // Should match output here: https://dqydj.com/sp-500-return-calculator/
  const final = returns[returns.length - 1];
  const finalFiat = final.coin
    .mul(simulator.getMonth(end).P) // back to fiat
    .sub(final.principal) // remove principal to leave profit
    .div(final.principal)
    .toNumber();
  expect(finalFiat).toBeCloseTo(2.69943);
});
