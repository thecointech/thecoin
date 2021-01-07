import { DbRecords, DepositRecord, UserAction } from "@the-coin/tx-firestore";
import { TransferRecord } from "@the-coin/tx-processing/base/types";
import { Timestamp } from "@the-coin/types/";
import { DateTime } from "luxon";
import { findName, spliceEmail } from "matchEmails";
import { AllData, TransactionRecord } from "./types";

function matchAll(data: AllData) {

}

function matchDB(data: AllData) {

  const purchases = convertPurchases(data);

  // const buys = convertType(dbs, "Buy");
  // const sales = convertType(dbs, "Sell");
  // const bills = convertType(dbs, "Bill");

  // const combined = [
  //   ...buys,
  //   ...sales,
  // ]
}

function convertPurchases(data: AllData) {
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
}

const toDateTime = (ts: Timestamp) => DateTime.fromMillis(ts.toMillis());

function convertAndFillPurchase(data: AllData, address: string, deposit: DepositRecord) {
  const record = convertTransferRecord(deposit);

  // first, find the eTransfer that initiated this transaction
  record.email = spliceEmail(data, address, record.data.fiatDisbursed, toDateTime(deposit.recievedTimestamp), deposit.sourceId);

  return record;
}

const convertTransferRecord = (record: TransferRecord) : TransactionRecord => ({

  action: type,
  database: record,
  data: {...record},
}))
