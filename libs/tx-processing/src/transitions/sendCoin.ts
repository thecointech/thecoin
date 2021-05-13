import { log } from "@thecointech/logging";
import { Decimal } from "decimal.js-light";
import { AnyActionContainer, getCurrentState, TransitionCallback } from "../statemachine/types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { TheCoin } from '@thecointech/contract';
import { DateTime } from "luxon";
import { toCoin } from "./toCoin";

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

  const settledDate = findSettledDate(container);
  var hash = await startTheTransfer(container.action.address, currentState.data.coin, settledDate, container.contract);

  // We only start the transfer (do not wait for completion).
  // If completion is required add 'waitCoin' transition.
  return {
    hash,
    coin: new Decimal(0),
  };
}

type EthersTx = {
  hash: string;
  wait: () => Promise<void>;
}

async function startTheTransfer(address: string, value: Decimal, settled: DateTime, contract: TheCoin)
{
  log.debug({address}, `Transfering ${value.toString()} to {address}`);

  const tx: EthersTx = await contract.coinPurchase(
    address,
    value.toString(),
    0,
    settled.toSeconds(),
  );
  return tx.hash;
}

function findSettledDate(container: AnyActionContainer) {
  const settlements = container.history.filter(t => t.delta.type == toCoin.name);
  return settlements[settlements.length - 1]?.delta.date ?? container.action.data.date;
}
