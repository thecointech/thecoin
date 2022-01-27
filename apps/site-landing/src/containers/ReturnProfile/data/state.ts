import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';

export type SimulationState = {
  // Date of snapshot
  date: DateTime;
  // How much contributed?
  principal: Decimal;
  // What is the current total value of the account.
 // value: Decimal;
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
