//
// A pre-transfer simply records the timestamp of an attempted transfer.
// This timestamp is used as a lock by a transfer event
// Return empty object and FSM will fill in the necessary details

import { makeTransition  } from '../makeTransition';
export const preTransfer = makeTransition("preTransfer", () => Promise.resolve({}));
