import { TheCoin } from "@thecointech/contract-core";
import { log } from "@thecointech/logging";
import { AnyActionContainer, getCurrentState } from "../types";
import { TransactionReceipt } from '@ethersproject/providers'
import { Decimal } from 'decimal.js-light';
import { NormalizeAddress } from '@thecointech/utilities';

//
// Wait for a transfer to complete
export async function waitCoin(container: AnyActionContainer) {

  const currentState = getCurrentState(container)
  const hash = currentState.delta.hash;
  if (!hash) return { error: "Cannot await transaction, no hash present"};
  const receipt = await waitTransaction(container.contract, hash);
  return receipt
    ? {
        meta: `confirmations: ${receipt.confirmations}`,
        coin: updateCoinBalance(container, receipt),
      }
    // Our tx has not yet been mined.  While not critical, it is concerning.
    // We have warned, but now return null to allow back-off-and-retry.
    : null
}


function parseLog(contract: TheCoin, log: TransactionReceipt["logs"][0]) {
  try {
    return contract.interface.parseLog(log)
  }
  catch {
    return null;
  }
}
export function updateCoinBalance(container: AnyActionContainer, receipt: TransactionReceipt) {

  const parsed = receipt.logs.map(l => parseLog(container.contract, l))
  // We use ExactTransfer instead of Transfer because we know there
  // will always be 1 and only 1 in any transaction we initiate.
  const [transfer, ...rest] = parsed.filter(p => p?.name == "ExactTransfer");
  if (!transfer || rest.length > 0)
    throw new Error(`Assumption Violated: ExactTransfer not as expected`);

  let balance = getCurrentState(container).data.coin ?? new Decimal(0);
  if (NormalizeAddress(transfer.args.from) == container.action.address) {
    balance = balance.plus(transfer.args.amount.toNumber());
  }
  else if (NormalizeAddress(transfer.args.to) == container.action.address) {
    balance = balance.minus(transfer.args.amount.toNumber());
  }
  else {
    log.error({ initialId: container.action.data.initialId, hash: receipt.transactionHash },
      "Could not find address for {initialId} in {hash}")
    throw new Error("Missing address, cannot")
  }
  return balance;
}

//
// Poll the provider to see if the transaction here has been mined.
export async function waitTransaction(contract: TheCoin, hash: string, confirmations: number = 3) : Promise<TransactionReceipt> {
  log.trace({hash}, `Awaiting transfer: {hash}`);
  const receipt = await contract.provider.waitForTransaction(hash, confirmations);
  if (!receipt) {
    log.warn({hash}, `Wait timed out for transfer: {hash}`);
  }
  log.trace({hash}, `Transfer complete: {hash}`);
  return receipt
}
