import { basicParams } from '../../../../internals/historical/simulation';
import { createParams } from './params';
import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { zeroState } from './state';
import { updateCreditBalances } from './credit';
import { one, zero } from './sim.decimal';

// static data
const start = DateTime.fromObject({ year: 2020 });
const market = [{
  Date: start,
  D: zero,
  P: one,
  E: zero,
  Fx: one,
}]

it('Charges interest on overdue amounts', () => {
  const {credit} = createParams(basicParams);
  const state = zeroState(start, market);

  const runSim = (week: number, expectedCurrent: number, expectedDue: number) => {
    state.date = start.plus({week});
    updateCreditBalances(credit, start, state);
    expect(state.credit.current.toNumber()).toEqual(expectedCurrent);
    expect(state.credit.balanceDue.todp(2).toNumber()).toEqual(expectedDue);
  }
  // Run until balance due
  runSim(1, 100, 0);
  runSim(2, 200, 0);
  runSim(3, 300, 0);
  runSim(4, 0, 400);
  runSim(5, 100, 400);
  runSim(6, 200, 400);
  expect(state.credit.outstanding).toBeFalsy();
  // Balance due cannot be paid, everything is transfered immediately to balanceDue
  runSim(7, 0, 711.75);
  // We should now be marked overdue
  expect(state.credit.outstanding).toBeTruthy();
})

it('immediately pays overdue amount', ()=> {
  const params = createParams(basicParams);
  const state = zeroState(start, market);
  // start with balance owing
  state.credit.balanceDue = new Decimal(200);
  state.credit.outstanding = true;

  const runSim = (week: number, expectedCurrent: number, expectedDue: number) => {
    state.date = start.plus({week});
    updateCreditBalances(params.credit, start, state);
    expect(state.credit.current.toNumber()).toEqual(expectedCurrent);
    expect(state.credit.balanceDue.todp(2).toNumber()).toEqual(expectedDue);
  }

  // Increment by one week
  runSim(1, 0, 301.44);
  // Deposit 200, run again
  state.coin = new Decimal(200);
  runSim(2, 0, 203.36);
  // Deposit another 200, run again
  state.coin = new Decimal(200);
  runSim(3, 0, 104.82);
  // Clear what's owed, run again
  state.coin = new Decimal(250);
  runSim(4, 0, 0);
  // At the end, we have spent $600 and repaid $605.8
  expect(state.coin.todp(2).toNumber()).toEqual(44.2);
  expect(state.credit.outstanding).toBeFalsy();
})
