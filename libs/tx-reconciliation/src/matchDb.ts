import { BaseTransactionRecord, DepositRecord, PurchaseType } from "@the-coin/tx-firestore";
import { UserAction } from "@the-coin/utilities/User";
import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { spliceBank } from "./matchBank";
import { matchManual } from "./matchManual";
import { Obsolete } from "@the-coin/tx-firestore/obsolete";
import { addReconciled } from "./utils";
import { AllData, Reconciliations, ReconciledRecord } from "types";


// Match all DB entries with raw data
export function matchDB(data: AllData) {

  // First, initialize with database records
  let r: Reconciliations = convertBaseTransactions(data, "Buy");
  const bills = convertBaseTransactions(data, "Bill");
  const sales = convertBaseTransactions(data, "Sell");
  addReconciled(r, bills);
  addReconciled(r, sales);

  const obsolete = convertObsolete(data);
  addReconciled(r, obsolete);

  matchManual(r, data);

  for (let i = 0; i < 30; i++) {
    matchTransactions(data, r, i);
  }

  // Pure debugging purpose fn's
  //matchTransactions(data, unMatched, 100);
  console.log(`Matched`);
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


function matchTransactions(data: AllData, reconciled: Reconciliations, maxDays: number) {
  for (const user of reconciled) {

    for (const record of user.transactions) {

      record.email = record.email ?? spliceEmail(data, user, record, maxDays);
      record.blockchain = record.blockchain ?? spliceBlockchain(data, user, record, record.data.hash);
      record.bank = spliceBank(data, user, record, maxDays);

      if (record.data.hashRefund && !record.refund)
        record.refund = spliceBlockchain(data, user, record, record.data.hashRefund) ?? undefined;

      // if (record.action == "Sell" && record.bank) {
      //   // was this an e-transfer, and was it cancelled?
      //   const confirmation = (record.data as any).confirmation;
      //   record.cancelled = findCancellation(data, record.bank.Amount, record.bank.Date, confirmation)
      // }
    }
  }
}

const convertBaseTransactionRecord = (record: BaseTransactionRecord, type: UserAction) : ReconciledRecord => ({
  action: type,
  database: record,
  data: {
    ...record,
    hash: record.hash.trim(),
  },

  email: null,
  bank: [],
  blockchain: null,
});

function convertObsolete(data: AllData) {
  return Object.entries(data.obsolete).map(([address, txs]) => {
    // find the bank record that matches this purchase
    const names = findNames(data, address);
    const transactions =  txs.map(tx => {
      const ob = tx as Obsolete;
      const dp = tx as DepositRecord;
      const recievedTimestamp = ob.recieved ?? dp.recievedTimestamp;
      const completedTimestamp = ob.completed ?? dp.completedTimestamp;
      const processedTimestamp = ob.settled ?? dp.processedTimestamp;
      const value = ob.coin ?? dp.transfer.value;
      const fiat = ob.fiat ?? dp.fiatDisbursed;
      const hash = ob.txHash ?? dp.hash;
      const type = PurchaseType.etransfer;
      const record :DepositRecord = {
        type,
        confirmed: true,
        hash,
        fiatDisbursed: fiat,
        recievedTimestamp,
        completedTimestamp,
        processedTimestamp,
        transfer: { value }
      };
      return record;
    })
    .map(deposit => ({
      action: "Buy" as UserAction,
      data: deposit,
      database: null,
      blockchain: null,
      email: null,
      bank: [],
    }))

    return {
      names,
      address,
      transactions,
    }
  })
};
