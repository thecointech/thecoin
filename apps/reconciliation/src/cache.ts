// import { Transaction } from "@the-coin/tx-blockchain";
// import { DbRecords } from "@the-coin/tx-firestore";
import { Timestamp } from "@the-coin/utilities/firestore";
import Decimal from "decimal.js-light";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { AllData } from "./types";

const rootpath = join(__dirname, "..", "src", "data");
const filepath = join(rootpath, 'data.cache.json');

export function writeCache(data: AllData) {
  //const sanitized = sanitize(data);
  if (!existsSync(rootpath)) {
    mkdirSync(rootpath);
  }
  writeFileSync(
    filepath,
    JSON.stringify(data)
  );
}

export function readCache() {
  if (existsSync(filepath)) {
    const asText = readFileSync(filepath, 'utf8');
    const asJson = JSON.parse(asText);

    asJson.eTransfers.forEach((et: any) => {
      et.cad = new Decimal(et.cad);
      et.recieved = DateTime.fromISO(et.recieved);
    })
    asJson.bank.forEach((tx: any) => {
      tx.Date = DateTime.fromISO(tx.Date);
    })
    asJson.blockchain.forEach((tx: any) => {
      tx.date = DateTime.fromISO(tx.date);
      tx.completed = tx.completed ? DateTime.fromISO(tx.completed) : undefined;
    })

    const convertTimestamp = (obj: any) =>
      obj
        ? Timestamp.fromMillis(obj._seconds * 1000 + obj._nanoseconds / 100000)
        : undefined;
    const convertDB = (col: any) => Object.values(col).forEach((txs: any) => {
      txs.forEach((tx: any) => {
        tx.recievedTimestamp = convertTimestamp(tx.recievedTimestamp)
        tx.processedTimestamp = convertTimestamp(tx.processedTimestamp)
        tx.completedTimestamp = convertTimestamp(tx.completedTimestamp)
      })
    });
    convertDB(asJson.dbs.Buy);
    convertDB(asJson.dbs.Sell);
    convertDB(asJson.dbs.Bill);

    return asJson as AllData;
  }
  return null;
}

export function writeResults() {

}
/*
function sanitize(data: AllData) {
  return {
    bank: sanitizeBank(data.bank),
    blockchain: sanitizeBlockchain(data.blockchain),
    dbs: sanitizeDbs(data.dbs),
  }
}

function sanitizeBank(bank: BankRecord[]) {
  return bank.map(bank => ({
    ...bank,
    Date: bank.Date.toMillis()
    }));
}

function sanitizeBlockchain(blockchain: Transaction[]) {
  return blockchain.map(tx => ({
    ...tx,
    date: tx.date.toMillis()
  }))
}

function sanitizeDBs(dbs: DbRecords) {
  return {
    Buy: {
      ...dbs.Buy,

    dbs.map(tx => ({
    ...tx,
    date: tx.date.toMillis()
  }))
}
*/
