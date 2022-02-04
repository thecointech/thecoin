import { basicParams } from './data.test'
import { createParams } from './params';
import { toFiat, zeroState } from './state';
import { applyShockAborber } from './sim.shockAbsorber';
import { SimulationState } from '.';
import { Decimal } from 'decimal.js-light';
import { DateTime, DurationObject } from 'luxon';
import { zero } from './sim.decimal';

const start = DateTime.fromObject({ year: 2020 });
const params = createParams({
  ...basicParams,
  maxDuration: { years: 10 },
  shockAbsorber: {
    // for a max drop of 50%
    absorbed: new Decimal(0.50),
    // Using up to 6% of profit
    cushionPercentage: new Decimal(0.06),
  }
});

const runAbsorber = (state: SimulationState, price: number, expectedFiat: number, date: DurationObject={year: 2020}) => {
  const data = {
    Date: DateTime.fromObject(date),
    P: new Decimal(price),
    D: zero,
    E: zero,
  }
  applyShockAborber(start, params, state, data);
  const currentFiat = toFiat(state.coin, data);
  expect(currentFiat.todp(2).eq(expectedFiat)).toBeTruthy();
}

it('cushions correctly when entire principal is protected', () => {
  const state = zeroState(start);
  state.coin = new Decimal(100);
  state.principal = new Decimal(10000);
  params.shockAbsorber.maximumProtected = new Decimal(10000);

  // First run, nothing changes
  runAbsorber(state, 100, 10000);
  // Market drops 10%
  runAbsorber(state, 90, 10000);
  // Market drops another 10%
  runAbsorber(state, 80, 10000);
  // Test slowly dropping past 50%
  runAbsorber(state, 51, 10000);
  runAbsorber(state, 50, 10000);
  runAbsorber(state, 49, 9800);
  // Market drops all the way to 40%, now we should have lost 20%
  runAbsorber(state, 40, 8000);
  // now it jumps back up to 80%
  runAbsorber(state, 80, 10000);

  // Test run up
  runAbsorber(state, 98, 10000);
  runAbsorber(state, 100, 10000);
  runAbsorber(state, 104, 10000);
  runAbsorber(state, 106, 10000);
  runAbsorber(state, 108, 10200);
  runAbsorber(state, 110, 10400);

  // before dropping all the way to 30%
  runAbsorber(state, 30, 6000);

  // Test wild swings
  runAbsorber(state, 120, 11400);
  runAbsorber(state, 25, 5000);
});

it('cushions correctly when only some principal is protected', () => {
  const state = zeroState(start);
  state.coin = new Decimal(100);
  state.principal = new Decimal(10000);
  params.shockAbsorber.maximumProtected = new Decimal(5000);

  // First run, nothing changes
  runAbsorber(state, 100, 10000);
  // Market drops 10%
  runAbsorber(state, 90, 9500);
  // Market drops another 10%
  runAbsorber(state, 80, 9000);
  // Test slowly dropping past 50%
  runAbsorber(state, 51, 7550);
  runAbsorber(state, 50, 7500);
  runAbsorber(state, 49, 7350);
  // Market drops all the way to 40%
  runAbsorber(state, 40, 6000);
  // Test run up
  runAbsorber(state, 98, 9900);
  runAbsorber(state, 100, 10000);
  runAbsorber(state, 101, 10050);
  runAbsorber(state, 104, 10200);
  runAbsorber(state, 106, 10300);
  runAbsorber(state, 108, 10500);
  runAbsorber(state, 110, 10700);
})

it ('grows the cushion over time', () => {
  const state = zeroState(start);
  state.coin = new Decimal(100);
  state.principal = new Decimal(10000);
  params.shockAbsorber.maximumProtected = new Decimal(10000);

  runAbsorber(state, 100, 10000, { year: 2020, month: 1 });
  runAbsorber(state, 104, 10000, { year: 2020, month: 3 });
  runAbsorber(state, 108, 10200, { year: 2020, month: 6 });

  runAbsorber(state, 110, 10200, { year: 2021, month: 1 });
  runAbsorber(state, 112, 10200, { year: 2021, month: 3 });
  runAbsorber(state, 114, 10400, { year: 2021, month: 6 });

})
