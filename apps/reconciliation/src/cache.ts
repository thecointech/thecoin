// import { Transaction } from "@the-coin/tx-blockchain";
// import { DbRecords } from "@the-coin/tx-firestore";
import { writeFileSync } from "fs";
import { join } from "path";
import { AllData } from "./types";


export function writeCache(data: AllData) {
  //const sanitized = sanitize(data);
  writeFileSync(
    join(__dirname, 'data.cache.json'),
    JSON.stringify(data)
  );
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
