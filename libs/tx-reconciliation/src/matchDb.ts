import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { spliceBank } from "./matchBank";
import { addReconciled } from "./utils";
import { AllData, Reconciliations, ReconciledRecord, ReconciledHistory, UserReconciled } from "./types";
import { ActionType, AnyTxAction, TxActionType } from "@thecointech/broker-db";
import { DateTime } from 'luxon';

// Match all DB entries with raw data
export function matchDB(data: AllData) {

  // First, initialize with database records
  const buys: Reconciliations = convertBaseTransactions(data, "Buy");
  const bills = convertBaseTransactions(data, "Bill");
  const sales = convertBaseTransactions(data, "Sell");

  let r: Reconciliations = [];
  addReconciled(r, buys);
  addReconciled(r, bills);
  addReconciled(r, sales);

  for (let i = 0; i < 30; i++) {
    matchTransactions(data, r, i);
  }
  // Catch those few far-flung early
  matchTransactions(data, r, 60);

  // Pure debugging purpose fn's
  //matchTransactions(data, unMatched, 100);
  console.log(`Matched`);
  return r;
}

export function convertBaseTransactions(data: AllData, type: TxActionType) {
  const allOfType = data.dbs[type];
  const converted = Object.entries(allOfType).map(([address, actions]: [string, AnyTxAction[]]) => {
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

const bankActions = [
  "sendETransfer",
  "payBill",
  "depositFiat",
  "depositFiatManual",
]

function fillBank(entry: ReconciledHistory, data: AllData, user: UserReconciled, initiated: DateTime, type: ActionType, maxDays: number) {
  if (entry.bank) return;
  if (bankActions.includes(entry.delta.type)) {
    const transferred = entry.state.fiat ?? entry.delta.fiat;
    if (!transferred) throw new Error("No Fiat found");
    const date = entry.delta.date ?? initiated;
    entry.bank = spliceBank(data, user, transferred, date, maxDays, type);
  };
}

function fillBlockchain(entry: ReconciledHistory, data: AllData) {
  if (entry.blockchain) return;
  if (entry.delta.type == "waitCoin") {
    const hash = entry.state.hash;
    if (!hash) throw new Error("Missing Hash on wait");
    entry.blockchain = spliceBlockchain(data, hash);
  }
}

function matchTransactions(data: AllData, reconciled: Reconciliations, maxDays: number) {
  for (const user of reconciled) {
    for (const record of user.transactions) {

      const reconciled = record.data!;
      record.email = record.email ?? spliceEmail(data, user, record, maxDays);

      for (const h of reconciled.history) {
        if (h.delta.error) continue;
        fillBank(h, data, user, record.data.initiated, record.data.type, maxDays);
        fillBlockchain(h, data);
      }
    }
  }
}

const convertBaseTransactionRecord = (record: AnyTxAction, type: TxActionType) : ReconciledRecord => ({
  // Basic/core data
  data: {
    type,
    id: record.data.initialId,
    initiated: record.data.date,
    fiat: record.history.find(h => h.fiat?.gt(0))?.fiat,
    coin: record.history.find(h => h.coin?.gt(0))?.coin,
    history: record.history.reduce((acc, h, idx) => {
      acc.push({
        state: {
          ...acc[idx - 1]?.state ?? {},
          ...acc[idx - 1]?.delta ?? {},
        },
        delta: h,
      });
      return acc;
    }, [] as ReconciledHistory[])
  },

  database: record,
  email: null,
});
