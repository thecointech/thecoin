import { AnyActionContainer, getCurrentState, TransitionCallback } from "../types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { TransactionResponse } from 'ethers';
import { toDelta } from './coinUtils';
import { log } from '@thecointech/logging';
import { makeTransition  } from '../makeTransition';
import type { CertifiedTransferRequest } from '@thecointech/types';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";

//
// Deposit an eTransfer and update fiat balance
export const depositCoin = makeTransition<BSActionTypes>("depositCoin", async (container) =>
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
  // Uber transfers require the specialized uberGraph; do not process them here
  if (!isCertTransfer(request.transfer)) {
    throw new Error("Uber transfer cannot be processed by depositCoin; use uberDepositCoin");
  }
  return await depositCertifiedTransfer(container, request.transfer);
}

const depositCertifiedTransfer = async (container: AnyActionContainer, transfer: CertifiedTransferRequest) => {
  const { chainId, from, to, value, fee, timestamp, signature } = transfer;
  const tc = container.contract;

  // Check balance (so we don't waste gas on a clearly-won't-work tx below)
  // We check balance in the initial steps as well, but this is for scenarios
  // where the deposit is delayed for any reason (eg - server crash etc);
  const balance = await tc.balanceOf(from);
  if (balance < (fee + value)) {
    return { error: 'Insufficient funds'};
  }


  log.debug({address: from, amount: value.toString()}, `CertTransfer of {amount} from {address}`);
  const tx: TransactionResponse = await tc.certifiedTransfer(chainId, from, to, value, fee, timestamp, signature);
  return toDelta(tx);
}

