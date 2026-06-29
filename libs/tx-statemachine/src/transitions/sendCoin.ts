import { log } from "@thecointech/logging";
import Decimal from 'decimal.js-light';;
import { getCurrentState, TransitionCallback } from "../types";
import { makeTransition  } from '../makeTransition';
import { verifyPreTransfer } from "./verifyPreTransfer";
import { DateTime } from "luxon";
import { toDelta } from './coinUtils';
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

  const { coin, date } = currentState.data;
  var tx = await startTheTransfer(container.action.address, coin, date, container.contract);

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

