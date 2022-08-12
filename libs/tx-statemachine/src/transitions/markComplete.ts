import { AnyActionContainer } from "../types";
import { removeIncomplete } from '@thecointech/broker-db';
import { getCurrentState } from '../types';
import { log } from '@thecointech/logging';
import { makeTransition  } from '../makeTransition';

//
// Remove from incomplete listings.
export const markComplete = makeTransition("markComplete", async (container) => {
  checkBalance(container, "coin");
  checkBalance(container, "fiat");
  // Remove from our list of active transactions
  await removeIncomplete(container.action.type, container.action.doc);
  // Make no state changes.
  return {};
});

// We should not mark an action complete that has any outstanding balances
function checkBalance(container: AnyActionContainer, type: "coin"|"fiat") {
  const balance = getCurrentState(container).data[type];
  if (balance && !balance.eq(0)) {
    log.error({ initialId: container.action.data.initialId },
      `Cannot mark action complete: ${type} balance detected: ${balance.toString()}`);
    throw new Error("Cannot complete action: balances detected");
  }
}
