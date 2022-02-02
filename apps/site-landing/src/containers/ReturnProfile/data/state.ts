import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { getMarketData, MarketData } from './market';
import { zero } from './sim.decimal';

export type SimulationState = {
  // Date of snapshot
  date: DateTime;
  // How much contributed?
  principal: Decimal;
  // Current value of the account in Coin. Effectively means "Shares".
  coin: Decimal;

  credit: {
    // Current balance owing (the amount we need to pay at next due date
    balanceDue: Decimal;
    // Current credit spending.  Does not include balanceOwed.
    current: Decimal;
    // If we have an amount outstanding, we immediately
    // pay down all spending.
    outstanding: boolean;
    // running total of how much cashback we've earned
    cashBackEarned: Decimal;
  },

  // The shock absorber protects principal from
  // market downturns.
  shockAbsorber: {
    // How `coin` has already been adjusted (up or down)
    coinAdjustment: Decimal;
    // How much offset we have *already* applied to the
    // current coin balance.
    //principalBaseline: Decimal;
  }

  // total spent on CO2 offsets
  offsetCO2: Decimal;
}

export const zeroState = (start: DateTime) => ({
  date: start,
  principal: zero,
  coin: zero,
  credit: {
    balanceDue: zero,
    current: zero,
    cashBackEarned: zero,
    outstanding: false,
  },
  shockAbsorber: {
    coinAdjustment: zero,
    //  totalCoinOffset: zero,
  },
  offsetCO2: zero,
})

// Clone existing state.  Placed here so if we make any changes to state
// we can easily update the cloning at the same time.
export const increment = (state: SimulationState, date: DateTime) => ({
  ...state,
  date,
  credit: {
    ...state.credit
  }
})

export const toFiat = (coin: Decimal, data: MarketData) => coin.mul(data.P)
export const toCoin = (coin: Decimal, data: MarketData) => coin.div(data.P)

export const calcFiat = (state: SimulationState, data: MarketData[]) =>
  toFiat(state.coin, getMarketData(state.date, data));

