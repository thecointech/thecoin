import { GetContract } from "@thecointech/contract";
import { log } from "@thecointech/logging";
import { Decimal } from "decimal.js-light";
import { ActionContainer, getCurrentState } from "statemachine/types";

//
// Deposit an eTransfer and update fiat balance
export async function waitCoin(container: ActionContainer) {

  const hash = getHash(container);
  if (!hash) return { error: "Invalid state, unexpected hash"};

  return await waitTransaction(hash)
    ? {
        coin: new Decimal(0),
        meta: undefined,
      }
    // Our tx has not yet been mined.  While not critical, it is concerning.
    // We warn, but return null to allow back-off-and-retry.
    : null
}

function getHash(container: ActionContainer) {
   // Assume last transition was sendCoin
   const currentState = getCurrentState(container)
   const hash = currentState.delta.meta;
   if (!hash || !hash.match(/[0-9a-f]{64}/i)) {
    log.error({hash}, "Invalid hash reported in meta: {hash}");
    return false
   }
   return hash;
}

//
// Poll the provider to see if the transaction here has been mined.
async function waitTransaction(hash: string, confirmations: number = 2) {
  // Poll every 1 second for 5 minutes to see if this transaction has been mined.
  log.trace({hash}, `Awaiting transfer: {hash}`);
  const contract = await GetContract();
  const receipt = await contract.provider.waitForTransaction(hash, confirmations);
  if (!receipt) {
    log.warn({hash}, `Wait timed out for transfer: {hash}`);
  }
  log.trace({hash}, `Transfer complete: {hash}`);
  return receipt
}
