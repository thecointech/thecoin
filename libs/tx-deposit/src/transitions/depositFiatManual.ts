import { makeTransition } from '@thecointech/tx-statemachine'
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';

export type Deposit = {
  fiat: Decimal;
  meta: string;
  date: DateTime;
}

export const makeDeposit = (deposit: Deposit) => {
  const depositFiatManual = makeTransition<"Buy">("depositFiatManual", () => Promise.resolve(deposit));
  return depositFiatManual;
}
