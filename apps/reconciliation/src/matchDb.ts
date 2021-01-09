import { BaseTransactionRecord, DepositRecord } from "@the-coin/tx-firestore";
import { Timestamp } from "@the-coin/types/";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";
import { spliceBank } from "./matchBank";
import { spliceBlockchain } from "./matchBlockchain";
import { findNames, spliceEmail } from "./matchEmails";
import { AllData, TransactionRecord } from "./types";

export function matchDB(data: AllData) {

  const purchases = convertPurchases(data);
  return purchases;
}

export function convertPurchases(data: AllData) {
  const deposits = Object.entries(data.dbs.Buy).map(([address, deposits]) => {

    // find the bank record that matches this purchase
    const names = findNames(data, address);
    const records = deposits.map(d => convertAndFillPurchase(data, address, d, names));
    // find the bank record that matches this purchase
    return {
      names,
      address,
      Buy: records,
    }
  });
  return deposits;
}

const toDateTime = (ts: Timestamp) => DateTime.fromMillis(ts.toMillis());
function convertAndFillPurchase(data: AllData, address: string, deposit: DepositRecord, names: string[]) {
  const record = convertBaseTransactionRecord(deposit, 'Buy');

  const recieved = toDateTime(deposit.recievedTimestamp);
  const completed = deposit.completedTimestamp ? toDateTime(deposit.completedTimestamp) : null;
  const amount = deposit.fiatDisbursed;
  // first, find the eTransfer that initiated this transaction
  if (!deposit.type || deposit.type == 'etransfer')
    record.email = spliceEmail(data, address, amount, recieved, names, deposit.sourceId);

  // Next, the tx hash should match blockchain
  record.blockchain = spliceBlockchain(data, record.data.hash);
  // Finally, can we find the bank deposit?
  record.bank = spliceBank(data, amount, completed, names);

  // Warn about mis-matched names
  if (record.bank?.Details && !names.includes(record.bank?.Details)) {
    console.warn(`Mismatched (or potentially multiple) names - ${names} : ${record.bank.Details} for account`);
    debugger;
  }
  return record;
}

const convertBaseTransactionRecord = (record: BaseTransactionRecord, type: UserAction) : TransactionRecord => ({
  action: type,
  database: record,
  data: {...record},

  email: null,
  bank: null,
  blockchain: null,
});
