import { BaseTransactionRecord, DepositRecord } from "@the-coin/tx-firestore";
import { UserAction } from "@the-coin/utilities/User";
import { toDateTime } from "./utils";
import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { AllData, Reconciliations } from "./types";
import { spliceBank } from "./matchBank";


function addReconciled(data: Reconciliations, more: Reconciliations) {
  for (const record of more) {
    const src = data.find(d => d.address == record.address);
    if (!src) data.push(record);
    else src.transactions.push(...record.transactions)
  }
}
export function matchDB(data: AllData) {

  // First, initialize with database records
  const r: Reconciliations = convertBaseTransactions(data, "Buy");
  for (let i = 0; i < 30; i++) {
    matchTransactions(data, r, "Buy", i);
  }

  const bills = convertBaseTransactions(data, "Bill");
  for (let i = 0; i < 30; i++) {
    matchTransactions(data, bills, "Bill", i);
  }
  addReconciled(r, bills);

  const sales = convertBaseTransactions(data, "Sell");
  for (let i = 0; i < 30; i++) {
    matchTransactions(data, sales, "Sell", i);
  }
  addReconciled(r, sales);

  // All purchases should be matched
  const unMatched = r.map(r => ({
    ...r,
    transactions: r.transactions.filter(tx =>
      (tx.action == "Buy" && tx.email == null) || tx.bank == null || tx.blockchain == null)
  })).filter(um => um.transactions.length > 0);
  for (const um of unMatched) {
    for (const umtx of um.transactions) {
      const email = umtx.email || umtx.action != "Buy" ? "" : " Email";
      const blockchain = umtx.blockchain ? "" : " blockchain";
      const bank = umtx.bank ? "" : " bank";
      console.log(`${umtx.data.recievedTimestamp.toDate()} ${umtx.action} ${um.names} - ${umtx.data.fiatDisbursed}, missing ${email}${blockchain}${bank}`)
    }
  }

  // Pure debugging purpose fn's
  matchTransactions(data, unMatched, "Buy", 100);
  console.log(`Matched`)
  return r;
}

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


function matchTransactions(data: AllData, reconciled: Reconciliations, action: UserAction, maxDays: number) {
  for (const rec of reconciled) {

    const purchases = rec.transactions;
    for (const record of purchases) {
      const { fiatDisbursed, recievedTimestamp, completedTimestamp, sourceId } = record.data as DepositRecord;
      let amount = fiatDisbursed;
      let details = undefined;
      let names: string[] = [];
      if (action == "Buy") {
        names = rec.names;
        details = "e-Transfer received";
        record.email = record.email ?? spliceEmail(data, rec.address, amount, toDateTime(recievedTimestamp), maxDays, sourceId);
      } else {
        amount = -amount;
      }

      record.blockchain = record.blockchain ?? spliceBlockchain(data, record.data.hash);
      record.bank = record.bank ?? spliceBank(data, amount, toDateTime(completedTimestamp), maxDays, names, details);
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
  data: {...record},

  email: null,
  bank: null,
  blockchain: null,
});
