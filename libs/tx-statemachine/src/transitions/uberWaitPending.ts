import { makeTransition  } from '../makeTransition';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";
//
// Remove from incomplete listings.
export const uberWaitPending = makeTransition<BSActionTypes>("uberWaitPending", async (container) => {
  // Remove from our list of active transactions
  const request = container.action.data.initial;
  if (isCertTransfer(request.transfer)) {
    throw new Error("Cannot deposit certified transfer");
  }

  // Block until time has passed transferMillis
  if (Date.now() < request.transfer.transferMillis) {
    return null;
  }

  return {};
});
