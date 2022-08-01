import { TransitionCallback } from '@thecointech/tx-statemachine'
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';

export type Deposit = {
  fiat: Decimal;
  meta: string;
  date: DateTime;
}

export const makeDeposit = (deposit: Deposit) : TransitionCallback<"Buy"> => {
  const depositFiatManual = () => Promise.resolve(deposit)
  return depositFiatManual;
}
