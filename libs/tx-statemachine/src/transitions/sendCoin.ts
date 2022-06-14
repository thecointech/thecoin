import { log } from "@thecointech/logging";
import { Decimal } from "decimal.js-light";
import { AnyActionContainer, getCurrentState, TransitionCallback } from "../types.js";
import { verifyPreTransfer } from "./verifyPreTransfer.js";
import { DateTime } from "luxon";
import { toCoin } from "./toCoin.js";
import { calculateOverrides, convertBN, toDelta } from './coinUtils.js';
import { last } from '@thecointech/utilities';
import type { TheCoin } from '@thecointech/contract-core';
import type { Overrides } from '@ethersproject/contracts';

//
// Send the current balance to the client.  If successful,
// this will reset the coin balance to 0
export async function sendCoin(container: AnyActionContainer) {
  return verifyPreTransfer(container) ?? await doSendCoin(container);
}

// implementation
const doSendCoin: TransitionCallback = async (container) => {
  const currentState = getCurrentState(container);
  if (!currentState.data.coin?.isPositive()) {
    return { error: 'Cannot send coin, state has no value' }
  }

  const overrides = await calculateOverrides(container, sendCoin);
  const settledDate = findSettledDate(container);
  var tx = await startTheTransfer(container.action.address, currentState.data.coin, settledDate, container.contract, overrides);

  // We only start the transfer (do not wait for completion).
  // If completion is required add 'waitCoin' transition.
  return toDelta(tx);
}

async function startTheTransfer(address: string, value: Decimal, settled: DateTime, contract: TheCoin, overrides: Overrides)
{
  log.debug({address}, `Transfering ${value.toString()} to {address} with overrides ${JSON.stringify(overrides, convertBN)}`);
  return contract.exactTransfer(
    address,
    value.toNumber(),
    settled.toMillis(),
    overrides
  );
}

function findSettledDate(container: AnyActionContainer) {
  const settlements = container.history.filter(t => t.delta.type == toCoin.name);
  return last(settlements)?.delta.date ?? container.action.data.date;
}
