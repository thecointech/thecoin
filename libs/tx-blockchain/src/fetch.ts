import { Transaction } from "./types";
import { TheCoin } from '@thecointech/contract-core';
import { BigNumber } from "@ethersproject/bignumber";
import { DateTime } from "luxon";
import { Decimal } from "decimal.js-light";
import { log } from '@thecointech/logging';
import type { ERC20Response } from '@thecointech/ethers-provider';
import {NormalizeAddress} from '@thecointech/utilities';

// Load account history and merge with local
export function mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
  const mergedHistory = history.concat(moreHistory);
  mergedHistory.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf());
  return mergedHistory;
}

function toDecimal(v: BigNumber) : Decimal;
function toDecimal(v?: BigNumber) { return v ? new Decimal(v.toString()) : undefined; }
const toTransaction = (tx: ERC20Response, fees: Record<string, ERC20Response>): Transaction => ({
  txHash: tx.hash,
  balance: 0,
  change: tx.value.toNumber(),
  counterPartyAddress: NormalizeAddress(tx.from),
  date: DateTime.fromSeconds(tx.timestamp),
  from: NormalizeAddress(tx.from),
  to: NormalizeAddress(tx.to),
  fee: toDecimal(fees[tx.hash]?.value),
  value: toDecimal(tx.value),
})

export async function loadAndMergeHistory(fromBlock: number, contract: TheCoin, address?: string) {

  try {
    const { provider } = contract;
    const contractAddress = contract.address;
    const allTxs = await provider.getERC20History({address, contractAddress, startBlock: fromBlock});

    // Fee's are listed separately here, but treated as a single TX in the rest of TheCoin
    const xferAssist = NormalizeAddress(process.env.WALLET_BrokerTransferAssistant_ADDRESS!);
    const fees = allTxs
      .filter(tx => NormalizeAddress(tx.to) == xferAssist)
      .reduce((acc, tx) => { acc[tx.hash] = tx; return acc }, {} as Record<string, ERC20Response>);
    const history = allTxs
      .filter(tx => NormalizeAddress(tx.to) != xferAssist)
      .map(tx => toTransaction(tx, fees));

    let exact = await fetchExactTimestamps(contract, fromBlock, address);
    for (const tx of history) {
      if (exact[tx.txHash]) {
        tx.date = DateTime.fromMillis(exact[tx.txHash]);
      }
      if (NormalizeAddress(tx.from) == address) {
        tx.change = -tx.change;
      }
    }

    return history;
  }
  catch (err: any) {
    log.error(err, err.message);
  }
  return [];
}

async function fetchExactTimestamps(contract: TheCoin, fromBlock: number, address?: string) {
  if (!address) {
    return await filterExactTransfers(contract, fromBlock, [null, null]);
  }
  else {
    const exactFrom = await filterExactTransfers(contract, fromBlock, [address, null]);
    const exactTo = await filterExactTransfers(contract, fromBlock, [null, address]);
    return {
      ...exactTo,
      ...exactFrom
    };
  }
}

async function filterExactTransfers(contract: TheCoin, fromBlock: number, addresses: [string|null, string|null]) {
  const filter = contract.filters.ExactTransfer(...addresses);
  (filter as any).startBlock = fromBlock;
  const logs = await contract.provider.getEtherscanLogs(filter, "and");
  return  logs.reduce((acc, item) => ({
    ...acc,
    [item.transactionHash]: contract.interface.parseLog(item).args.timestamp.toNumber()
  }), {} as Record<string, number>);
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
