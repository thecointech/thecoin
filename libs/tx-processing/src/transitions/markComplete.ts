import { AnyActionContainer } from "../statemachine/types";
import { removeIncomplete } from '@thecointech/broker-db';

//
// Remove from incomplete listings.
export async function markComplete(action: AnyActionContainer) {
  // Remove from our list of active transactions
  await removeIncomplete(action.action.type, action.action.doc.path);
  // Make no state changes.
  return {};
}
