import { basicParams } from '../../../../internals/historical/simulation'
import { createParams } from './params';
import { grossFiat, zeroState } from './state';
import { applyShockAborber } from './sim.shockAbsorber';
import { SimulationState } from '.';
import { DateObjectUnits, DateTime } from 'luxon';
import { one, zero } from './sim.decimal';
import Decimal from 'decimal.js-light';

const start = DateTime.fromObject({ year: 2020 });
const params = createParams({
  ...basicParams,
  maxOffsetPercentage: 0,
  shockAbsorber: {
    // for a max drop of 50%
    cushionDown: new Decimal(0.50),
    // Using up to 6% of profit
    cushionUp: new Decimal(0.06),
  }
});

const runAbsorber = (state: SimulationState, price: number, expectedFiat: number, date: DateObjectUnits={year: 2020}) => {
  const d = DateTime.fromObject(date)
  state.date = d;
  state.market = {
    Date: d,
    P: new Decimal(price),
    D: zero,
    E: zero,
    Fx: one,
  }

  applyShockAborber(start, params, state);
  const currentFiat = grossFiat(state);
  expect(currentFiat.todp(2).toNumber()).toEqual(expectedFiat);
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

  // Note, because the principal is capped at 10K, some of the
  // account keeps growing even as the 10K is capped.
  // also, it no longer matches $1 gain == 1% gain because
  // it is now compounded from 108
  runAbsorber(state, 108, 10200, { year: 2021, month: 1 });
  runAbsorber(state, 112, 10207.41, { year: 2021, month: 3 });
  // 6% up means cushion capped & 6% of 200 profit
  runAbsorber(state, 114.48, 10212, { year: 2021, month: 3 });
  // 8% up means cushion capped & 2% of 10000 & 8% of 200 profit
  runAbsorber(state, 116.64, 10416, { year: 2021, month: 6 });
})
