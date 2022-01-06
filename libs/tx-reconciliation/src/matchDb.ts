import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { spliceBank } from "./matchBank";
import { addReconciled } from "./utils";
import { AllData, Reconciliations, ReconciledRecord } from "types";
import { ActionType, AnyAction } from "@thecointech/broker-db";


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

export function convertBaseTransactions(data: AllData, type: ActionType) {
  const allOfType = data.dbs[type];
  const converted = Object.entries(allOfType).map(([address, actions]: [string, AnyAction[]]) => {
    // find the bank record that matches this purchase
    const names = findNames(data, address);
    const records = actions.map(d => convertBaseTransactionRecord(d, type));
    // find the bank record that matches this purchase
    return {
      names,
      address,
      transactions: records,
    }
  });
  return converted;
}


function matchTransactions(data: AllData, reconciled: Reconciliations, maxDays: number) {
  for (const user of reconciled) {

    for (const record of user.transactions) {
      const database = record.database!;
      record.email = record.email ?? spliceEmail(data, user, record, maxDays);
      record.bank = database.history
        .filter(h => h.fiat)
        .map(h => spliceBank(data, user, h, database.type, maxDays))
      record.blockchain = database.history
        .filter(h => h.hash)
        .map(h => spliceBlockchain(data, user, h.coin!, h.hash))
    }
  }
}

const convertBaseTransactionRecord = (record: AnyAction, type: ActionType) : ReconciledRecord => ({
  // Basic/core data
  data: {
    type,
    id: record.data.initialId,
    initiated: record.data.date,
    fiat: record.history.find(h => h.fiat?.gt(0))?.fiat,
    coin: record.history.find(h => h.coin?.gt(0))?.coin,
  },

  database: record,
  email: null,
  bank: [],
  blockchain: [],
});
