import { log } from "@thecointech/logging";
import Decimal from 'decimal.js-light';;
import { AnyActionContainer, getCurrentState, TransitionCallback } from "../types";
import { makeTransition  } from '../makeTransition';
import { verifyPreTransfer } from "./verifyPreTransfer";
import { DateTime } from "luxon";
import { toCoin } from "./toCoin";
import { toDelta } from './coinUtils';
import { last } from '@thecointech/utilities';
import type { TheCoin } from '@thecointech/contract-core';

//
// Send the current balance to the client.  If successful,
// this will reset the coin balance to 0
export const sendCoin = makeTransition('sendCoin', async (container) =>
  await verifyPreTransfer(container) ?? await doSendCoin(container)
)

// implementation
const doSendCoin: TransitionCallback = async (container) => {
  const currentState = getCurrentState(container);
  if (!currentState.data.coin?.isPositive()) {
    return { error: 'Cannot send coin, state has no value' }
  }

  const settledDate = findSettledDate(container);
  var tx = await startTheTransfer(container.action.address, currentState.data.coin, settledDate, container.contract);

  // We only start the transfer (do not wait for completion).
  // If completion is required add 'waitCoin' transition.
  return toDelta(tx);
}

async function startTheTransfer(address: string, value: Decimal, settled: DateTime, contract: TheCoin)
{
  log.debug({address, amount: value.toString()}, 'Transfering {amount} to {address}');
  return contract.exactTransfer(
    address,
    value.toNumber(),
    settled.toMillis(),
  );
}

function findSettledDate(container: AnyActionContainer) {
  const settlements = container.history.filter(t => t.delta.type == toCoin.transitionName);
  return last(settlements)?.delta.date ?? container.action.data.date;
}
