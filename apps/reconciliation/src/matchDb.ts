import { BaseTransactionRecord } from "@the-coin/tx-firestore";
import { UserAction } from "@the-coin/utilities/User";
import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { AllData, Reconciliations } from "./types";
import { spliceBank } from "./matchBank";
import { matchManual } from "./matchManual";


// Match all DB entries with raw data
export function matchDB(data: AllData) {

  // First, initialize with database records
  let r: Reconciliations = convertBaseTransactions(data, "Buy");
  const bills = convertBaseTransactions(data, "Bill");
  const sales = convertBaseTransactions(data, "Sell");
  addReconciled(r, bills);
  addReconciled(r, sales);

  matchManual(r, data);

  for (let i = 0; i < 30; i++) {
    matchTransactions(data, r, i);
  }


  // Pure debugging purpose fn's
  //matchTransactions(data, unMatched, 100);
  console.log(`Matched`);
  return r;
}

function addReconciled(data: Reconciliations, more: Reconciliations) {
  for (const record of more) {
    const src = data.find(d => d.address == record.address);
    if (!src) data.push(record);
    else src.transactions.push(...record.transactions)
  }
}

// Remove eronneous transactions
// function filterZeroValueRecords(r: Reconciliations, data: AllData) {
//   // Debugging info
//   const zvr = r.map(user => ({
//     ...user,
//     transactions: user.transactions.filter(tx => tx.data.fiatDisbursed === 0),
//   })).filter(user => user.transactions.length !== 0);

//   // Fix any transactions that actually shifted some value
//   for (const user of zvr) {
//     for (const tx of user.transactions) {
//       if (tx.data.transfer.value > 0) {
//         const bc = block
//       }
//     }
//   }
//   return r;
//   // console.log(`${zvr.length} users had a total of ${zvr.reduce((tot, user) => tot + user.transactions.length, 0)} zero-sized transactions`);
//   // return r.map(user => ({
//   //   ...user,
//   //   transactions: user.transactions.filter(tx => tx.data.fiatDisbursed !== 0),
//   // }));
// }

export function convertBaseTransactions(data: AllData, action: UserAction) {
  const deposits = Object.entries(data.dbs[action]).map(([address, deposits]) => {

    // find the bank record that matches this purchase
    const names = findNames(data, address);
    const records = deposits.map((d: BaseTransactionRecord) => convertBaseTransactionRecord(d, action));
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
      record.blockchain = record.blockchain ?? spliceBlockchain(data, user, record, record.data.hash);
      record.bank = record.bank ?? spliceBank(data, user, record, maxDays);

      if (record.data.hashRefund)
        record.refund = record.blockchain ?? spliceBlockchain(data, user, record, record.data.hashRefund);
    }
  }
}

// function matchBills(data: AllData, reconciled: Reconciliations, maxDays: number) {
//   for (const rec of reconciled) {
//     const bills = rec.transactions;
//     for (const record of bills) {
//       const { fiatDisbursed, completedTimestamp } = record.data as DepositRecord;
//       record.blockchain = record.blockchain ?? spliceBlockchain(data, record.data.hash);
//       record.bank = record.bank ?? spliceBank(data, -fiatDisbursed, toDateTime(completedTimestamp), maxDays, []);
//     }
//   }
// }

// function matchPurchase(data: AllData, deposit: DepositRecord, address: string, names: string[]) {

//   // first, find the eTransfer that initiated this transaction
//   if (!deposit.type || deposit.type == 'etransfer')
//     record.email = spliceEmail(data, address, amount, recieved, names, deposit.sourceId);

//   const record = convertBaseTransactionRecord(deposit, 'Buy');

//   const recieved = toDateTime(deposit.recievedTimestamp);
//   const completed = deposit.completedTimestamp ? toDateTime(deposit.completedTimestamp) : null;
//   const amount = deposit.fiatDisbursed;
//   // first, find the eTransfer that initiated this transaction
//   if (!deposit.type || deposit.type == 'etransfer')
//     record.email = spliceEmail(data, address, amount, recieved, names, deposit.sourceId);

//   // Next, the tx hash should match blockchain
//   record.blockchain = spliceBlockchain(data, record.data.hash);
//   // Finally, can we find the bank deposit?
//   record.bank = spliceBank(data, amount, completed, names);

//   // Warn about mis-matched names
//   if (record.bank?.Details && !names.includes(record.bank?.Details)) {
//     console.warn(`Mismatched (or potentially multiple) names - ${names} : ${record.bank.Details} for account`);
//     debugger;
//   }
//   return record;
// }

const convertBaseTransactionRecord = (record: BaseTransactionRecord, type: UserAction) => ({
  action: type,
  database: record,
  data: {
    ...record,
    hash: record.hash.trim(),
  },

  email: null,
  bank: null,
  blockchain: null,
});
