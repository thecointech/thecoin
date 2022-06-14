import type { IBank } from "@thecointech/bank-interface";
import { BankRecord } from "./types.js";

export async function fetchBankTransactions(bankApi: IBank) {
  const txs = await bankApi.getTransactions(new Date(2016, 1), new Date());
  return txs
    .map((tx): BankRecord => ({
      Description: tx.Description1!,
      Amount: tx.CAD!,
      Details: tx.Description2,
      Date: tx.TransactionDate,
    }))
}

export function removeCancelled(txs: BankRecord[]) {
  // Remove cancelled transactions
  const cancelled = txs.filter(p => p.Description.startsWith("INTERAC e-Transfer cancel"));
  for (const c of cancelled) {
    // Find the most recent matching tx, and remove it.
    const match = txs
      .filter(tx => tx.Amount == -c.Amount)
      .filter(tx => tx.Description.startsWith("e-Transfer sent"))
      .filter(tx => tx.Date.toMillis() <= c.Date.toMillis())
      .sort((a, b) => b.Date.toMillis() - a.Date.toMillis());
    if (match.length == 0) throw new Error("Invalid Everything");

    txs = txs.filter(tx => tx != match[0] && tx != c);
  }
  return txs;
}
