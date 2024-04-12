import { nextOpenTimestamp } from '@thecointech/market-status';
import { DateTime } from 'luxon';
import { makeTransition } from '../makeTransition';
import { getCurrentState } from '../types';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';
import Decimal from 'decimal.js-light';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";


// Convert fiat to coin
export const uberUnlockPendingFiat = makeTransition<BSActionTypes>( "uberUnlockPendingFiat", async (container) => {
  const currentState = getCurrentState(container);
  // An action should not contain multiple fiat actions
  if (currentState.data.fiat?.isPositive()) {
    return { error: 'Cannot unlock fiat, action already has fiat balance' }
  }

  const request = container.action.data.initial;
  // Certified transfer should not end up here!
  if (isCertTransfer(request.transfer)) {
    throw new Error("Cannot deposit certified transfer");
  }

  // We can only function with CAD
  // (Ie, pending TC actions are out-of-scope)
  if (request.transfer.currency !== 124) {
    throw new Error("Cannot unlock fiat, wrong currency");
  }

  // Are we close enough to unlock time?
  const transferDate = DateTime.fromMillis(request.transfer.transferMillis);
  const now = DateTime.now();
  // In the future?
  if (now < transferDate) {
    const nextOpen = DateTime.fromMillis(await nextOpenTimestamp(now));
    // And it won't open soon enough?
    if (nextOpen < transferDate) {
      return null;
    }
  }

  // So, we can unlock now.
  return {
    fiat: new Decimal(request.transfer.amount),
  }
});
