

///////////////////////////////////////////////////////////////////////////////////

import { Transaction } from "./types";
import { Contract } from "ethers";
import { toHuman } from "@the-coin/utilities";
import { Log } from "ethers/providers";
import { DateTime } from "luxon";


// Load account history and merge with local
function mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
  const uniqueItems = moreHistory.filter((tx) => !history.find((htx) => htx.txHash === tx.txHash))
  if (uniqueItems.length) {
    history = history.concat(uniqueItems);
    history.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf())
  }
  return history;
}

async function addAdditionalInfo(transaction: Transaction, toWallet: boolean, contract: Contract): Promise<boolean> {
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
      const { balance, timestamp } = extra.values;
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

async function transferToTransaction(toWallet: boolean, ethersLog: Log, contract: Contract): Promise<Transaction> {
  const res = contract.interface.parseLog(ethersLog);
  const { from, to, value } = res.values;
  var r: Transaction = {
    txHash: ethersLog.transactionHash,
    date: new DateTime(),
    completed: new DateTime(),
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

async function readAndMergeTransfers(account: string, to: boolean, fromBlock: number, contract: Contract, history: Transaction[]) {
  // construct filter to get tx either from or to
  const args = to ? [null, account] : [account, null];
  let filter: any = contract.filters.Transfer(...args);
  filter.fromBlock = fromBlock || 0;

  // Retrieve logs
  const txLogs = await contract.provider.getLogs(filter)
  // Convert logs to our transactions
  let txs: Transaction[] = [];
  for (let i = 0; i < txLogs.length; i++) {
    const tx = await transferToTransaction(to, txLogs[i], contract);
    txs.push(tx);
  }
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

export async function loadAndMergeHistory(address: string, fromBlock: number, contract: Contract, history: Transaction[]) {
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

export function calculateTxBalances(currentBalance: number, history: Transaction[]) {
  var lastBalance = currentBalance;
  history.reverse().forEach(tx => {
    if (tx.balance >= 0) {
      if (lastBalance != tx.balance)
        console.error('Invalid balance detected: ', lastBalance, history, tx);
      lastBalance = tx.balance;
    }
    else {
      // tx balance records the balance after the action
      // is finished (so the last action records current balance)
      tx.balance = lastBalance;
    }
    lastBalance = lastBalance -= tx.change;
  });
}
