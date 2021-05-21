import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { spliceBank } from "./matchBank";
import { addReconciled } from "./utils";
import { AllData, Reconciliations, ReconciledRecord } from "types";
import { ActionType } from "@thecointech/broker-db";


// Match all DB entries with raw data
export function matchDB(data: AllData) {

  // First, initialize with database records
  const r: Reconciliations = convertBaseTransactions(data, "Buy");
  const bills = convertBaseTransactions(data, "Bill");
  const sales = convertBaseTransactions(data, "Sell");
  addReconciled(r, bills);
  addReconciled(r, sales);

  throw new Error("Yes, fix this too");
  // matchManual(r, data);

  for (let i = 0; i < 30; i++) {
    matchTransactions(data, r, i);
  }

  // Pure debugging purpose fn's
  //matchTransactions(data, unMatched, 100);
  console.log(`Matched`);
  return r;
}

export function convertBaseTransactions(data: AllData, action: ActionType) {
  const deposits = Object.entries(data.dbs[action]).map(([address, deposits]) => {

    // find the bank record that matches this purchase
    const names = findNames(data, address);
    const records = deposits.map((d: any)=> convertBaseTransactionRecord(d, action));
    // find the bank record that matches this purchase
    return {
      names,
      address,
      transactions: records,
    }
  });
  return deposits;
}


function matchTransactions(data: AllData, reconciled: Reconciliations, maxDays: number) {
  for (const user of reconciled) {

    for (const record of user.transactions) {

      record.email = record.email ?? spliceEmail(data, user, record, maxDays);
      record.blockchain = record.blockchain ?? spliceBlockchain(data, user, record, "TODO");
      record.bank = spliceBank(data, user, record, maxDays);

      // if (record.data.hashRefund && !record.refund)
      //   record.refund = spliceBlockchain(data, user, record, "TODO") ?? undefined;
    }
  }
}

const convertBaseTransactionRecord = (record: any, type: ActionType) : ReconciledRecord => ({
  database: record,
  action: {
    type,
    ...record,
    hash: record.hash.trim(),
  },

  email: null,
  bank: [],
  blockchain: null,
});
