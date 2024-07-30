import { isInternalAddress, Transaction } from "./types";
import type { TheCoin } from '@thecointech/contract-core';
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

function toDecimal(v: BigInt) : Decimal;
function toDecimal(v?: BigInt) { return v ? new Decimal(v.toString()) : undefined; }
const toTransaction = (tx: ERC20Response): Transaction => ({
  txHash: tx.hash,
  balance: 0,
  change: Number(tx.value),
  counterPartyAddress: NormalizeAddress(tx.from),
  date: DateTime.fromSeconds(tx.timestamp),
  from: NormalizeAddress(tx.from),
  to: NormalizeAddress(tx.to),
  value: toDecimal(tx.value),
})

export async function loadAndMergeHistory(fromBlock: number, contract: TheCoin, address?: string) {

  try {
    const contractAddress = await contract.getAddress();
    // Fetching data requires etherscan (Infura limits logs length to 149)
    const provider = new Erc20Provider();
    const allTxs = await provider.getERC20History({address, contractAddress, fromBlock});
    const contractClean = contract.connect(provider);

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
    // Apply exact timestamps
    const normalizedAddress = address ? NormalizeAddress(address) : address;
    const history = Object.values(converted)
    const exact = await fetchExactTimestamps(contractClean, fromBlock, address);
    for (const tx of history) {
      if (exact[tx.txHash]) {
        tx.date = DateTime.fromMillis(exact[tx.txHash]);
      }
      if (NormalizeAddress(tx.from) == normalizedAddress) {
        tx.change = -tx.change;
      }
    }
    const sorted = history.sort((a, b) => a.date.toMillis() - b.date.toMillis());
    return sorted;
  }
  catch (err: any) {
    log.error(err, err.message);
  }
  return [];
}

async function fetchExactTimestamps(contract: TheCoin, fromBlock: number, address?: string) {
  if (!address) {
    return await filterExactTransfers(contract, fromBlock, [undefined, undefined]);
  }
  else {
    const exactFrom = await filterExactTransfers(contract, fromBlock, [address, undefined]);
    const exactTo = await filterExactTransfers(contract, fromBlock, [undefined, address]);
    return {
      ...exactTo,
      ...exactFrom
    };
  }
}

async function filterExactTransfers(contract: TheCoin, fromBlock: number|string, addresses: [string|undefined, string|undefined], toBlock?: number|string) : Promise<Record<string, number>> {
  const filter = contract.filters.ExactTransfer(...addresses);
  try {
    const logs = await contract.queryFilter(filter, fromBlock, toBlock);
    return logs.reduce((acc, item) => ({
      ...acc,
      [item.transactionHash]: Number(item.args.timestamp)
    }), {} as Record<string, number>);
  }
  catch (err: unknown) {
    // NOTE: This catch was implemented for infura, however it turned out to be
    // much simpler to simply use etherscan.  Leaving this here for reference
    // but it should not be relied on as working code
    if (err instanceof Error) {
      // Ethers wraps the error we actually want
      const error = (err as any).error;
      if (error?.code === -32005) {
        // query returned more than XXX results, split & re-query
        const { from, to } = error.data;
        if (from && to) {
          // If we have this error, we can split & re-query
          console.log(`Split query: ${from} - ${to}`);
          const first = await filterExactTransfers(contract, from, addresses, to);
          const second = await filterExactTransfers(contract, to, addresses);
          return {
            ...first,
            ...second
          }
        }
      }
    }
    throw err;
  }
}

export function calculateTxBalances(currentBalance: bigint, history: Transaction[]) {
  // history is sorted - oldest first.
  let balance = currentBalance;
  for (let i = history.length - 1; i >= 0; i--) {
    const tx = history[i];
    tx.balance = Number(balance);
    balance = balance - BigInt(tx.change);
  }
}
