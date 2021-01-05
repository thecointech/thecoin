import { RbcApi } from "@the-coin/rbcapi";
import { DateTime } from "luxon";

export type BankRecord = {
  Date: DateTime,
	Description: string,
	Details: string,
	Amount: number
}

export async function fetchBankTransactions(bankApi: RbcApi) {
  const txs = await bankApi.fetchLatestTransactions();
  return txs
    .filter(tx => tx.Description1 === "e-Transfer received")
    .map((tx): BankRecord => ({
      Description: tx.Description1!,
      Amount: tx.CAD!,
      Details: tx.Description2 || "-- not set --",
      Date: tx.TransactionDate,
    }))
}
