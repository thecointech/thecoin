import type { TheCoin } from "@thecointech/contract-core";
import { log } from "@thecointech/logging";
import { AnyActionContainer, getCurrentState } from "../types";
import { TransactionReceipt } from 'ethers'
import Decimal from 'decimal.js-light';
import { NormalizeAddress } from '@thecointech/utilities';
import { makeTransition } from '../makeTransition';

//
// Wait for a transfer to complete
export const waitCoin = makeTransition("waitCoin", async (container) => {

  const currentState = getCurrentState(container)
  // NOTE!  This only processes transfers
  // that happened immediately prior in the graph
  const hash = currentState.delta.hash;
  if (!hash) {
    // This is theoretically legal (if, for example, an
    // ubertransfer was made that completed immediately)
    // however, it shouldn't actually happen using harvester,
    // so make it an error until we fix
    // https://github.com/thecointech/thecoin/issues/525
    log.error("Cannot await transaction, no hash present");
    return {}
  }

  const receipt = await waitTransaction(container.contract, hash);
  const confirmations = await receipt?.confirmations();
  return receipt
    ? {
        meta: `confirmations: ${confirmations}`,
        ...updateCoinBalance(container, receipt),
        // Prevent this tx from being used again
        hash: ""
      }
    // Our tx has not yet been mined.  While not critical, it is concerning.
    // We have warned, but now return null to allow back-off-and-retry.
    : null
});


function parseLog(contract: TheCoin, log: TransactionReceipt["logs"][0]) {
  try {
    return contract.interface.parseLog(log)
  }
  catch {
    return null;
  }
}
export function updateCoinBalance(container: AnyActionContainer, receipt: TransactionReceipt) {

  // TODO: Check for success and return failure in that case.
  // if (receipt.status === 0)

  const parsed = receipt.logs.map(l => parseLog(container.contract, l));

  // We use ExactTransfer instead of Transfer to ensure we
  const exactTransfers = parsed.filter(p => p?.name == "ExactTransfer");
  // Only use the transfer from the current user to us(?)
  const legalAddresses = [
    NormalizeAddress(process.env.WALLET_BrokerCAD_ADDRESS!),
    container.action.address,
  ]
  const [transfer, ...rest] = exactTransfers.filter(t => (
    legalAddresses.includes(NormalizeAddress(t?.args.from)) &&
    legalAddresses.includes(NormalizeAddress(t?.args.to))
  ));

  if (!transfer) {
    // We expect a transfer, but couldn't find one that matched us.
    // If there was an ExactTransfer but we aren't involved, that's an issue
    // (It is legal to have 0 transfers with UberConverter)
    if (exactTransfers.length !== 0) {
      log.error(
        { initialId: container.action.data.initialId, hash: receipt.hash },
        "ExactTransfer found for {initialId} in {hash}, but it does not match Broker address"
      );
      // We have no idea what is going on here, so hard-stop
      throw new Error("ExactTransfer not as expected");
    }

    return undefined;
  }
  if (rest.length > 0) {
    // We have too many transfers, so we don't know what to do.
    throw new Error(`Assumption Violated: ExactTransfer not as expected`);
  }

  let balance = getCurrentState(container).data.coin ?? new Decimal(0);
  if (NormalizeAddress(transfer.args.from) == container.action.address) {
    balance = balance.plus(transfer.args.amount.toString());
  }
  else if (NormalizeAddress(transfer.args.to) == container.action.address) {
    balance = balance.minus(transfer.args.amount.toString());
  }
  else {
    log.error({ initialId: container.action.data.initialId, hash: receipt.hash },
      "Could not find address for {initialId} in {hash}")
    throw new Error("Missing address, cannot")
  }
  return { coin: balance };
}

//
// Poll the provider to see if the transaction here has been mined.
export async function waitTransaction(contract: TheCoin, hash: string, requiredConfirmations: number = 3, timeout = 60_000) : Promise<TransactionReceipt|null> {

  // Wait up to 60 seconds for this transaction to finish
  // Our volume is so low it's nice to complete tx's asap,
  // and we should give them a little time to complete in one run.
  try {
    log.info({hash, timeout: timeout / 1000}, 'Waiting up to {timeout} seconds for tx {hash}');
    const receipt = await contract.runner?.provider?.waitForTransaction(hash, requiredConfirmations, timeout);
    if (receipt?.status == 1) {
      log.info({hash, receiptStatus: receipt?.status}, 'Transaction {hash} mined with status: {receiptStatus}');
      return receipt;
    }
    else {
      log.error({hash, receiptStatus: receipt?.status}, 'Transaction {hash} not mined with status: {receiptStatus}');
    }
  }
  catch (e: any) {
    // First, can we see what is going wrong here?
    log.error({ err: e, hash}, "Error waiting for tx {hash}");
    try {
      const receipt = await contract.runner?.provider?.getTransaction(hash);
      if (receipt) {
        log.info({
          hash,
          confirmations: await receipt.confirmations(),
        }, "Transaction {hash} found with with {confirmations} confirmations");
      }
    }
    catch (_) { /* ignore */ }
  }
  return null;

}
