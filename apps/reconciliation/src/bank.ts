import { RbcApi } from "@the-coin/rbcapi";
import { BankRecord } from "./types";


export async function fetchBankTransactions(bankApi: RbcApi) {
  const txs = await bankApi.getTransactions(new Date(2014, 5), new Date());
  return txs
    .map((tx): BankRecord => ({
      Description: tx.Description1!,
      Amount: tx.CAD!,
      Details: tx.Description2,
      Date: tx.TransactionDate,
    }))
}
