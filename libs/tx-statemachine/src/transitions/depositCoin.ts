import { Decimal } from "decimal.js-light";
import { getCurrentState, TransitionCallback, TypedActionContainer } from "../types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { TransactionResponse } from '@ethersproject/providers';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";

//
// Deposit an eTransfer and update fiat balance
export async function depositCoin(container: TypedActionContainer<BSActionTypes>) {
  return verifyPreTransfer(container) ?? await doDepositCoin(container);
}

// implementation
const doDepositCoin: TransitionCallback<BSActionTypes> = async (container) => {
  const currentState = getCurrentState(container);
  // An action should not contain multiple coin deposits
  if (currentState.data.coin?.isPositive()) {
    return { error: 'Cannot deposit coin, action already has coin balance' }
  }

  const request = container.action.data.initial;
  const { from, to, value, fee, timestamp, signature } = request.transfer;
  const tc = container.contract;

  // Check balance (so we don't waste gas on a clearly-won't-work tx below)
  // We check balance in the initial steps as well, but this is for scenarios
  // where the deposit is delayed for any reason (eg - server crash etc);
  const balance = await tc.balanceOf(from);
  if (balance.lte(fee + value))
    return { error: 'Insufficient funds'};

  const tx: TransactionResponse = await tc.certifiedTransfer(from, to, value, fee, timestamp, signature);
  return (tx.hash)
    ? {
        hash: tx.hash,
        coin: new Decimal(value),
        meta: tx.confirmations.toString()
      }
    : {
        error: 'Tx Hash returned null',
        hash: undefined,
        meta: `Nonce: ${tx.nonce}`,
      }
}
