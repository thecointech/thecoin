import { getCurrentState, TransitionCallback, TypedActionContainer } from "../types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { TransactionResponse } from '@ethersproject/providers';
import { calculateOverrides, convertBN, toDelta } from './coinUtils';
import { log } from '@thecointech/logging';
import { makeTransition  } from '../makeTransition';
import type { UberTransfer } from '@thecointech/types';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";

//
// Deposit an eTransfer and update fiat balance
export const uberDepositCoin = makeTransition<BSActionTypes>("uberDepositCoin", async (container) =>
  await verifyPreTransfer(container) ?? await doDepositCoin(container)
)

// implementation
const doDepositCoin: TransitionCallback<BSActionTypes> = async (container) => {
  const currentState = getCurrentState(container);
  // An action should not contain multiple coin deposits
  if (currentState.data.coin?.isPositive()) {
    return { error: 'Cannot deposit coin, action already has coin balance' }
  }

  const request = container.action.data.initial;
  // Certified transfer should not end up here!
  if (isCertTransfer(request.transfer)) {
    throw new Error("Cannot deposit certified transfer");
  }
  return await depositUberTransfer(container, request.transfer);
}

const depositUberTransfer = async (container: TypedActionContainer<BSActionTypes>, transfer: UberTransfer) => {
  const { chainId, from, to, amount, currency, signature, signedMillis, transferMillis } = transfer;
  const tc = container.contract;

  // Check balance (so we don't waste gas on a clearly-won't-work tx below)
  // We check balance in the initial steps as well, but this is for scenarios
  // where the deposit is delayed for any reason (eg - server crash etc);
  log.warn("DepositUberTransfer needs safeguards");
  // const balance = await tc.pl_balanceOf(from);
  // if (balance.lte(amount))
  //   return { error: 'Insufficient funds'};

  const overrides = await calculateOverrides(container, uberDepositCoin);
  log.debug(
    {address: from, initialId: container.action.data.initialId },
    `UberTransfer of ${amount.toString()} from {address} with overrides ${JSON.stringify(overrides, convertBN)}`
  );
  const tx: TransactionResponse = await tc.uberTransfer(chainId, from, to, amount, currency, transferMillis, signedMillis, signature, overrides);
  log.debug(
    {address: from, nonce: tx.nonce, initialId: container.action.data.initialId },
    `UberTransfer complete with nonce: {nonce}`
  );
  return toDelta(tx);
}

