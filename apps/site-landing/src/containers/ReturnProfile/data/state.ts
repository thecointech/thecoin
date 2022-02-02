import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { getMarketData, MarketData } from './market';

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
  }

  offsetCO2: Decimal;

  // What is the maximum protected value?
  protected: Decimal;
}

// Clone existing state.  Placed here so if we make any changes to state
// we can easily update the cloning at the same time.
export const increment = (state: SimulationState, date: DateTime) => ({
  ...state,
  date,
  credit: {
    ...state.credit
  }
})

export const calcFiat = (state: SimulationState, data: MarketData[]) => state.coin.mul(getMarketData(state.date, data)?.P ?? 1)
