import { makeTransition } from '@thecointech/tx-statemachine';

//
// Refund any fiat in this
// TODO: this
export const etransferCancelled = makeTransition<"Sell">("etransferCancelled", async () => null);
