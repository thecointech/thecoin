import { log } from "@thecointech/logging";
import { eTransferData } from "@thecointech/tx-gmail";
import { Decimal } from "decimal.js-light";
import { ActionContainer, getCurrentState, TransitionCallback } from "../statemachine/types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { TheCoin } from '@thecointech/contract';
import { DateTime } from "luxon";
import { toCoin } from "./toCoin";

//
// Deposit an eTransfer and update fiat balance
export const sendCoin: TransitionCallback = async (container) =>
  verifyPreTransfer(container) ?? doSendCoin(container);

// implementation
const doSendCoin: TransitionCallback = async (container) => {
  const currentState = getCurrentState(container);
  if (!currentState.data.coin?.isPositive()) {
    return { error: 'Cannot send coin, no value registered' }
  }
  const initialId = container.action.data.initialId;
  const eTransfer = container.source as eTransferData;
  const settlement = findSettlement(container);

  if (!settlement) {
    return { error: 'Cannot find settlment date'};
  }
  log.debug({ initialId, address: eTransfer.address },
    `Beginning coin transfer to satisfy {initialId} from {address}`);

  var hash = await startTheTransfer(eTransfer.address, currentState.data.coin, settlement.timestamp, container.contract);
  // Return immediately without waiting to confirm.
  // This is because we are currently in the waiting state!
  return { meta: hash };

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

function findSettlement(container: ActionContainer) {
  const settlements = container.history.filter(t => t.delta.type == toCoin.name);
  return settlements[settlements.length - 1]?.delta;
}
