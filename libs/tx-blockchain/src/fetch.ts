import { Transaction } from "./types";
import { TheCoin } from '@thecointech/contract-core';
import { BigNumber } from "@ethersproject/bignumber";
import { DateTime } from "luxon";
import { Decimal } from "decimal.js-light";
import { log } from '@thecointech/logging';
import { ChainProvider, ERC20Response } from '@thecointech/ethers-provider';
import {NormalizeAddress} from '@thecointech/utilities';

// Load account history and merge with local
export function mergeTransactions(history: Transaction[], moreHistory: Transaction[]) {
  const mergedHistory = history.concat(moreHistory);
  mergedHistory.sort((tx1, tx2) => tx1.date.valueOf() - tx2.date.valueOf());
  return mergedHistory;
}

const toTransaction = (tx: ERC20Response) : Transaction => ({
  txHash: tx.hash,
  balance: 0,
  change: tx.value.toNumber(),
  counterPartyAddress: tx.from,
  date: DateTime.fromSeconds(tx.timestamp),
  from: tx.from,
  to: tx.to,
  value: new Decimal(tx.value.toNumber()),
})

export async function loadAndMergeHistory(address: string, fromBlock: number, contract: TheCoin) {

  const provider = new ChainProvider(
    process.env.DEPLOY_POLYGON_NETWORK!,
    process.env.POLYGONSCAN_API_KEY!
  );
  try {
    const contractAddress = contract.address;
    const allTxs = await provider.getERC20History({address, contractAddress, startBlock: fromBlock});
    const history = allTxs.map(toTransaction);

    const exact = await fetchExactTimestamps(provider, contract, fromBlock, address);
    for (const tx of history) {
      if (exact[tx.txHash])
        tx.date = DateTime.fromMillis(exact[tx.txHash]);
      if (NormalizeAddress(tx.from) == address)
        tx.change = -tx.change;
    }
    return history;
  }
  catch (err) {
    log.error(err);
  }
  return [];
}

async function fetchExactTimestamps(provider: ChainProvider, contract: TheCoin, fromBlock: number, address: string) {
  const exactFrom = await filterExactTransfers(provider, contract, fromBlock, [address, null]);
  const exactTo = await filterExactTransfers(provider, contract, fromBlock, [null, address]);
  return [...exactTo, ...exactFrom].reduce((acc, item) => ({
    ...acc,
    [item.transactionHash]: contract.interface.parseLog(item).args.timestamp.toNumber()
  }), {} as Record<string, number>);
}

async function filterExactTransfers(provider: ChainProvider, contract: TheCoin, fromBlock: number, addresses: [string|null, string|null]) {
  const filter = contract.filters.ExactTransfer(...addresses);
  (filter as any).startBlock = fromBlock;
  return provider.getEtherscanLogs(filter, "and")
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
