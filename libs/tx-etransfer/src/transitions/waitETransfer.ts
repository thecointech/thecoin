import { makeTransition } from '@thecointech/tx-statemachine';

//
// Wait for the e-transfer to be deposited.
export const waitETransfer = makeTransition<"Sell">("waitETransfer", async () => {
  // In the future, this will check the e-transfer status somehow,
  // It should not succeed until the e-transfer is deposited by the user.
  // For now, just assume every transfer succeeds.
  return {};
});
