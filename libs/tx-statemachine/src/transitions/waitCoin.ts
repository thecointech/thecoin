import { TheCoin } from "@thecointech/contract-core";
import { log } from "@thecointech/logging";
import { AnyActionContainer, getCurrentState } from "../types";
import { TransactionReceipt } from '@ethersproject/providers'

//
// Wait for a transfer to complete
export async function waitCoin(container: AnyActionContainer) {

  const currentState = getCurrentState(container)
  const hash = currentState.delta.hash;
  if (!hash) return { error: "Cannot await transaction, no hash present"};
  const receipt = await waitTransaction(container.contract, hash);
  return receipt
    ? {
        meta: `status: ${receipt.status}`,
      }
    // Our tx has not yet been mined.  While not critical, it is concerning.
    // We have warned, but now return null to allow back-off-and-retry.
    : null
}

//
// Poll the provider to see if the transaction here has been mined.
async function waitTransaction(contract: TheCoin, hash: string, confirmations: number = 2) : Promise<TransactionReceipt> {
  log.trace({hash}, `Awaiting transfer: {hash}`);
  const receipt = await contract.provider.waitForTransaction(hash, confirmations);
  if (!receipt) {
    log.warn({hash}, `Wait timed out for transfer: {hash}`);
  }
  log.trace({hash}, `Transfer complete: {hash}`);
  return receipt
}
