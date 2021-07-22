

///////////////////////////////////////////////////////////////////////////////////

import { Transaction } from "./types";
import { TheCoin } from '@thecointech/contract';
import { EventFilter, providers, BigNumber } from "ethers";
import { toHuman } from "@thecointech/utilities";
import { DateTime } from "luxon";


// Load account history and merge with local
export function mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
  const mergedHistory = history.concat(moreHistory);
  mergedHistory.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf());
  return mergedHistory;

  // NOTE - this old implementation gave us bad results on sending tx's to yourself, but
  // I don't remember why it was implemetned this way in the first place.

  // const uniqueItems = moreHistory.filter((tx) => !history.find((htx) => htx.txHash === tx.txHash))
  // if (uniqueItems.length) {
  //   history = history.concat(uniqueItems);
  //   history.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf())
  // }
  // return history;
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

//async function  purchaseToTransaction(account: string, ethersLog: Log, contract: Contract): Promise<Transaction> {
//   const res = contract.interface.parseLog(ethersLog);
//   const {purchaser, amount, balance, timestamp} = res.values;
//   if (account != purchaser)
//     return null;
//   return {
//     txHash: ethersLog.transactionHash,
//     date: new Date(timestamp.toNumber() * 1000),
//     change: amount.toNumber(),
//     logEntry: `Purchase: ${amount.toNumber()}`,
//     balance: balance.toNumber()
//   }
// }

//async function  readAndMergePurchases(account: string, fromBlock: number, contract: Contract, history: Transaction[]) {
//   // construct filter to get tx either from or to
//   let filter: any = contract.filters.Purchase();
//   filter.fromBlock = fromBlock || 0;
//   // Retrieve logs
//   const txLogs = await contract.provider.getLogs(filter)
//   // Convert logs to our transactions
//   let txs: Transaction[] = [];
//   for (let i = 0; i < txLogs.length; i++) {
//     const tx = await purchaseToTransaction(account, txLogs[i], contract);
//     if (tx)
//       txs.push(tx);
//   }
//   // merge and remove duplicates for complete array
//   return mergeTransactions(history, txs);
// }

export async function loadAndMergeHistory(address: string, fromBlock: number, contract: TheCoin, history: Transaction[]) {
  try {
    //history = await readAndMergePurchases(address, fromBlock, contract, history);
    history = await readAndMergeTransfers(address, true, fromBlock, contract, history);
    history = await readAndMergeTransfers(address, false, fromBlock, contract, history);
  }
  catch (err) {
    console.error(err);
  }
  return history;
}

export function calculateTxBalances(currentBalance: BigNumber, history: Transaction[]) {
  //let lastBalance = currentBalance;
  // history.reverse().forEach(tx => {
  //   // if (tx.balance >= 0) {
  //   //   if (lastBalance != tx.balance)
  //   //     console.error('Invalid balance detected: ', lastBalance, history, tx);
  //   //   lastBalance = tx.balance;
  //   // }
  //   // else {
  //     // tx balance records the balance after the action
  //     // is finished (so the last action records current balance)

  //   //}
  //   tx.balance = lastBalance.toNumber();
  //   lastBalance = lastBalance.sub(tx.change);
  // });

  // history is sorted - oldest first.
  let balance = currentBalance;
  for (let i = history.length - 1; i >= 0; i--) {
    const tx = history[i];
    tx.balance = balance.toNumber();
    balance = balance.sub(tx.change);
  }
}
