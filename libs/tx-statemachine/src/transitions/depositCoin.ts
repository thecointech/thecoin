import { AnyActionContainer, getCurrentState, TransitionCallback, TypedActionContainer } from "../types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { TransactionResponse } from 'ethers';
import { toDelta } from './coinUtils';
import { log } from '@thecointech/logging';
import { makeTransition  } from '../makeTransition';
import type { CertifiedTransferRequest, UberTransfer } from '@thecointech/types';
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
  return isCertTransfer(request.transfer)
    ? await depositCertifiedTransfer(container, request.transfer)
    : await depositUberTransfer(container, request.transfer);
}

const depositCertifiedTransfer = async (container: AnyActionContainer, transfer: CertifiedTransferRequest) => {
  const { chainId, from, to, value, fee, timestamp, signature } = transfer;
  const tc = container.contract;

  // Check balance (so we don't waste gas on a clearly-won't-work tx below)
  // We check balance in the initial steps as well, but this is for scenarios
  // where the deposit is delayed for any reason (eg - server crash etc);
  const balance = await tc.balanceOf(from);
  if (balance <= (fee + value))
    return { error: 'Insufficient funds'};


  log.debug({address: from, amount: value.toString()}, `CertTransfer of {amount} from {address}`);
  const tx: TransactionResponse = await tc.certifiedTransfer(chainId, from, to, value, fee, timestamp, signature);
  return toDelta(tx);
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

  log.debug({address: from, amount: amount.toString()}, 'UberTransfer of {amount} from {address}');
  const tx: TransactionResponse = await tc.uberTransfer(chainId, from, to, amount, currency, transferMillis, signedMillis, signature);
  return toDelta(tx);
}

