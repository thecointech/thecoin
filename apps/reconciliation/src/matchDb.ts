import { BaseTransactionRecord, DepositRecord } from "@the-coin/tx-firestore";
import { Timestamp } from "@the-coin/types/";
import { UserAction } from "@the-coin/utilities/User";
import { DateTime } from "luxon";
import { spliceBlockchain } from "./matchBlockchain";
import { findName, spliceEmail } from "./matchEmails";
import { AllData, TransactionRecord } from "./types";



export function matchDB(data: AllData) {

  const purchases = convertPurchases(data);

  // const buys = convertType(dbs, "Buy");
  // const sales = convertType(dbs, "Sell");
  // const bills = convertType(dbs, "Bill");

  // const combined = [
  //   ...buys,
  //   ...sales,
  // ]
  return purchases;
}




export function convertPurchases(data: AllData) {
  const deposits = Object.entries(data.dbs.Buy).map(([address, deposits]) => {

    // find the bank record that matches this purchase
    const name = findName(data, address);
    const records = deposits.map(d => convertAndFillPurchase(data, address, d));
    // find the bank record that matches this purchase
    return {
      name,
      address,
      Buy: records,
    }
  });
  return deposits;
}

const toDateTime = (ts: Timestamp) => DateTime.fromMillis(ts.toMillis());

function convertAndFillPurchase(data: AllData, address: string, deposit: DepositRecord) {
  const record = convertBaseTransactionRecord(deposit, 'Buy');

  // first, find the eTransfer that initiated this transaction
  record.email = spliceEmail(data, address, record.data.fiatDisbursed, toDateTime(deposit.recievedTimestamp), deposit.sourceId);
  // Next, the tx hash should match blockchain
  record.blockchain = spliceBlockchain(data, record.data.hash);

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
