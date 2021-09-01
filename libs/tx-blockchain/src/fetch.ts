import { Transaction } from "./types";
import { TheCoin } from '@thecointech/contract';
import { EventFilter, providers, BigNumber } from "ethers";
import { toHuman } from "@thecointech/utilities";
import { DateTime } from "luxon";
import { log } from '@thecointech/logging';

// Load account history and merge with local
export function mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
  const mergedHistory = history.concat(moreHistory);
  mergedHistory.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf());
  return mergedHistory;
}

async function addAdditionalInfo(transaction: Transaction, toWallet: boolean, contract: TheCoin): Promise<boolean> {
  const { txHash } = transaction;
  if (!txHash)
    return false;

  // Parse out additional purchase/redeem info
  const txReceipt = await contract.provider.getTransactionReceipt(txHash);
  if (!txReceipt.logs || !txReceipt.blockHash)
    return false;

  const blockData = await contract.provider.getBlock(txReceipt.blockHash)

  for (let i = 0; i < txReceipt.logs.length; i++) {
    const extra = contract.interface.parseLog(txReceipt.logs[i]);
    if (extra && extra.name == "Purchase") {
      const { balance, timestamp } = extra.args;
      transaction.date = DateTime.fromMillis(timestamp.toNumber() * 1000);
      transaction.completed = DateTime.fromMillis(blockData.timestamp * 1000);
      const change = toHuman(transaction.change, true);
      if (toWallet) {
        transaction.balance = balance.toNumber();
        transaction.logEntry = `Purchase: ${change}`
      }
      else {
        transaction.logEntry = `Sell: ${change}`
      }
      return true;
    }
  }
  return false;
}

async function transferToTransaction(toWallet: boolean, ethersLog: providers.Log, contract: TheCoin): Promise<Transaction> {
  const res = contract.interface.parseLog(ethersLog);
  const { from, to, value } = res.args;
  var r: Transaction = {
    txHash: ethersLog.transactionHash,
    date: DateTime.local(),
    change: toWallet ? value.toNumber() : -value.toNumber(),
    logEntry: "---",
    balance: -1,
    counterPartyAddress: toWallet ? from : to
  }

  if (!await addAdditionalInfo(r, toWallet, contract)) {
    const block = await contract.provider.getBlock(ethersLog.blockNumber!);
    r.date = DateTime.fromMillis(block.timestamp * 1000)
    r.logEntry = `Transfer: ${toWallet ? from : to}`
  }
  return r;
}

export async function readTransfers(contract: TheCoin, filter: EventFilter, to:boolean) {
  // Retrieve logs
  const txLogs = await contract.provider.getLogs(filter)
  // Convert logs to our transactions
  let txs: Transaction[] = [];
  for (let i = 0; i < txLogs.length; i++) {
    const tx = await transferToTransaction(to, txLogs[i], contract);
    txs.push(tx);
  }
  return txs;
}

async function readAndMergeTransfers(account: string, to: boolean, fromBlock: number, contract: TheCoin, history: Transaction[]) {
  // construct filter to get tx either from or to
  const args = to ? [null, account] : [account, null];
  let filter = contract.filters.Transfer(...args);
  (filter as any).fromBlock = fromBlock || 0;

  const txs = await readTransfers(contract, filter, to);

  // merge and remove duplicates for complete array
  return mergeTransactions(history, txs);
}

export async function loadAndMergeHistory(address: string, fromBlock: number, contract: TheCoin) {
  try {
    let history: Transaction[] = [];
    history = await readAndMergeTransfers(address, true, fromBlock, contract, history);
    history = await readAndMergeTransfers(address, false, fromBlock, contract, history);
    return history;
  }
  catch (err) {
    log.error(err);
  }
  return [];
}

export function calculateTxBalances(currentBalance: BigNumber, history: Transaction[]) {
  // history is sorted - oldest first.
  let balance = currentBalance;
  for (let i = history.length - 1; i >= 0; i--) {
    const tx = history[i];
    tx.balance = balance.toNumber();
    balance = balance.sub(tx.change);
  }
}
