import { basicParams } from './data.test'
import { createParams } from './params';
import { toFiat, zeroState } from './state';
import { applyShockAborber } from './sim.shockAbsorber';
import { MarketData } from '.';
import { Decimal } from 'decimal.js-light';
import { DateTime } from 'luxon';
import { zero } from './sim.decimal';
import { expect, it } from '@jest/globals'

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

it('SA cushions correctly when entire principal is protected', () => {
  const state = zeroState(start);
  state.coin = new Decimal(100);
  state.principal = toFiat(state.coin, market);
  const principal = state.principal.toNumber();
  params.shockAbsorber.maximumProtected = principal;

  const runAbsorber = (price: number, expectedFiat: number) => {
    market.P = new Decimal(price);
    applyShockAborber(start, params, state, market);
    const currentFiat = toFiat(state.coin, market);
    expect(currentFiat.todp(2).eq(expectedFiat)).toBeTruthy();
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
})
