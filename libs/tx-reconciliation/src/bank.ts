import type { IBank } from "@thecointech/bank-interface";
import { BankRecord } from "./types";

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


