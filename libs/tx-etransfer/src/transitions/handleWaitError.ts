import { makeTransition } from '@thecointech/tx-statemachine';
import Decimal from 'decimal.js-light';

//
// Handle an error from waiting for an e-transfer deposit.
// If the e-transfer was returned, restore the fiat balance so the graph
// can convert it back to coin and send it back to the user.
export const handleWaitError = makeTransition<"Sell">("handleWaitError", async (container) => {

  // The only error we can handle automatically is the "etransfer: returned" error
  const lastTransition = container.history?.at(-1);

  const lastCoin = lastTransition?.data.coin;
  if (!lastCoin || !lastCoin.isZero()) {
    return { error: "Last state coin must be zero" }
  }

  const { error, date } = lastTransition.delta;
  if (!date) {
    return { error: "Wait error missing date: cannot handle automatically" }
  }
  if (error !== "etransfer: returned") {
    return { error: "Unexpected error: cannot handle automatically" }
  }

  // Handle the error.  For now, we assume a human admin has re-claimed the money.
  const fiatTransitions = container.history.filter(d => d.delta.fiat && d.delta.fiat.gt(0));
  if (fiatTransitions.length !== 1) {
    return { error: `Unexpected fiat transactions in history: found ${fiatTransitions.length}, expected 1` }
  }

  // This was how much was initially deposited.
  const fiat = fiatTransitions[0].delta.fiat;

  // Ok, this resets this transaction back to having this amount
  return {
    error: "",
    coin: new Decimal(0),
    fiat,
    date,
  };
});
