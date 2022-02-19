import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { getMarketData, MarketData } from './market';
import { one, zero } from './sim.decimal';

export type SimulationState = {
  // Date of snapshot
  date: DateTime;
  // How much contributed?
  principal: Decimal;
  // Current value of the account in Coin. Effectively means "Shares".
  // This is all coin held, including adjustments from shockAbsorber
  coin: Decimal;
  // market data for month
  market: MarketData;

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
    // How `coin` is currently adjusted (up or down)
    // Positive values mean we added to `coin` to cushion drop,
    // negative values mean we subbed from `coin` to cushion jump
    coinAdjustment: Decimal;

    // Over time, we may also cushion profits (as well as principal)
    // We store the adjustment here in order to keep an accurate
    // record of principal
    principalAdjustment: Decimal;

    // The amount of cushion gathered.  This is the sum of each
    // years coinAdjustment (just prior to reset).  This is not
    // used in the simulation, and is only ever negative
    // (we do not reset during a drop)
    totalCushionGathered: Decimal;
  }

  // total spent on CO2 offsets
  offsetCO2: Decimal;
}

export const zeroState = (start: DateTime, market?: MarketData[]) : SimulationState => ({
  date: start,
  principal: zero,
  coin: zero,
  market: market
    ? getMarketData(start, market)
    : {
        Date: start,
        D: zero,
        P: zero,
        E: zero,
        Fx: one,
      },
  credit: {
    balanceDue: zero,
    current: zero,
    cashBackEarned: zero,
    outstanding: false,
  },
  shockAbsorber: {
    coinAdjustment: zero,
    principalAdjustment: zero,
    totalCushionGathered: zero,
  },
  offsetCO2: zero,
})

// Increment state.  Placed here so if we make any changes to state
// we can easily update the cloning at the same time.
export const increment = (state: SimulationState, data: MarketData[]) => {
  const date = state.date.plus({week: 1});
  return {
    ...state,
    date,
    market: getMarketData(date, data),
    credit: {
      ...state.credit
    },
    shockAbsorber: {
      ...state.shockAbsorber
    }
  }
}

export const toFiat = (coin: Decimal, data: MarketData) => coin.mul(data.P).mul(data.Fx)
export const toCoin = (coin: Decimal, data: MarketData) => coin.div(data.P.mul(data.Fx))

export const grossFiat = (state: SimulationState) =>
  toFiat(state.coin, state.market);
export const netFiat = (s: SimulationState) =>
  grossFiat(s)
    .sub(s.credit.current)
    .sub(s.credit.balanceDue)
    .toNumber()
