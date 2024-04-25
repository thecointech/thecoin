import { isInternalAddress, Transaction } from "./types";
import type { TheCoin } from '@thecointech/contract-core';
import { BigNumber } from "ethers";
import { DateTime } from "luxon";
import Decimal from 'decimal.js-light';;
import { log } from '@thecointech/logging';
import { Erc20Provider, ERC20Response } from '@thecointech/ethers-provider/Erc20Provider';
import {NormalizeAddress} from '@thecointech/utilities';

// Load account history and merge with local
export function mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
  const mergedHistory = history.concat(moreHistory);
  mergedHistory.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf());
  return mergedHistory;
}

function toDecimal(v: BigNumber) : Decimal;
function toDecimal(v?: BigNumber) { return v ? new Decimal(v.toString()) : undefined; }
const toTransaction = (tx: ERC20Response): Transaction => ({
  txHash: tx.hash,
  balance: 0,
  change: tx.value.toNumber(),
  counterPartyAddress: NormalizeAddress(tx.from),
  date: DateTime.fromSeconds(tx.timestamp),
  from: NormalizeAddress(tx.from),
  to: NormalizeAddress(tx.to),
  value: toDecimal(tx.value),
})

export async function loadAndMergeHistory(fromBlock: number, contract: TheCoin, address?: string) {

  try {
    const contractAddress = contract.address;
    const provider = new Erc20Provider();
    const allTxs = await provider.getERC20History({address, contractAddress, fromBlock});

    // Fee's are listed separately here, but treated as a single TX in the rest of TheCoin
    //const xferAssist = NormalizeAddress(process.env.WALLET_BrokerTransferAssistant_ADDRESS!);
    // const fees = allTxs
    //   .filter(tx => NormalizeAddress(tx.to) == xferAssist)
    //   .reduce((acc, tx) => { acc[tx.hash] = tx; return acc }, {} as Record<string, ERC20Response>);
    // const history = allTxs
    //   .filter(tx => NormalizeAddress(tx.to) != xferAssist)
    //   .map(tx => toTransaction(tx, fees));

    const converted: Record<string, Transaction> = {};
    for (const tx of allTxs) {
      if (!converted[tx.hash])
        converted[tx.hash] = toTransaction(tx);
      else if (isInternalAddress(tx.to)) {
        // Check assumption.  This might fail when plugins are integrated
        if (converted[tx.hash].fee) throw new Error("Multiple potential fee's found for transaction");
        // When a second transaction is incurred, it implies the second transaction is a fee
        converted[tx.hash].fee = toDecimal(tx.value);
      }
    }
    const history = Object.values(converted).sort((a, b) => a.date.toMillis() - b.date.toMillis());

    let exact = await fetchExactTimestamps(contract, provider, fromBlock, address);
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

async function fetchExactTimestamps(contract: TheCoin, provider: Erc20Provider, fromBlock: number, address?: string) {
  if (!address) {
    return await filterExactTransfers(contract, provider, fromBlock, [null, null]);
  }
  else {
    const exactFrom = await filterExactTransfers(contract, provider, fromBlock, [address, null]);
    const exactTo = await filterExactTransfers(contract, provider, fromBlock, [null, address]);
    return {
      ...exactTo,
      ...exactFrom
    };
  }
}

async function filterExactTransfers(contract: TheCoin, provider: Erc20Provider, fromBlock: number, addresses: [string|null, string|null]) {
  const filter = contract.filters.ExactTransfer(...addresses);
  const logs = await provider.getEtherscanLogs({
    ...filter,
    fromBlock
  }, "and");
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
