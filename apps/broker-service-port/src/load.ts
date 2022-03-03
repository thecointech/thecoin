import { Timestamp } from "@thecointech/firestore";
import { Decimal } from "decimal.js-light";
import { existsSync, readFileSync } from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { Reconciliations } from "./types";
import { log } from '@thecointech/logging';

// file deepcode ignore no-any: JSON processing is basically all 'any'

export const cacheFullPath = (path?: string) =>
  path ?? process.env["USERDATA_CACHE_PATH"] ?? "/temp/UserData/Cache";

const RECONCILED_CACHE_NAME = 'reconciled.cache.json';

export const readReconciledCache = (cacheName?: string, path?: string) =>
  readCache(convertReconciledFromJson, cacheName ?? RECONCILED_CACHE_NAME, path);


function readCache<T>(conversion: (json: any) => T, cacheName: string, path?: string) {
  const cachePath = cacheFullPath(path);
  const filePath = join(cachePath, cacheName);
  if (existsSync(filePath)) {
    const asText = readFileSync(filePath, 'utf8');
    const asJson = JSON.parse(asText);
    log.debug(`Read cache from ${filePath}`);
    return conversion(asJson)
  }
  log.debug(`Cache not found at: ${filePath}`);
  return null;
}


export function convertReconciledFromJson(asJson: any) {
  const asReconciled = asJson as Reconciliations;
  for (const user of asReconciled) {
    for (const tx of user.transactions) {
      convertTimestamps(tx.data);
      convertTimestamps(tx.database);
      convertETransfer(tx.email);
      tx.bank.forEach(convertBank);
      convertBlockchain(tx.blockchain)
      convertBlockchain(tx.refund);
    }
    convertTimestamps(user.data);
  }
  return asReconciled;
}


const convertTimestamp = (obj: any, prefix = "") =>
  obj
    ? Timestamp.fromMillis(obj[`${prefix}seconds`] * 1000 + obj[`${prefix}nanoseconds`] / 1000000)
    : undefined;
const convertTimestamps = (tx: any) => {
  if (tx) {
    Object.entries(tx).forEach(([s, v]) => {
      const maybeTs: any = v;
      if (!!maybeTs?._seconds)
        tx[s] = convertTimestamp(maybeTs, "_")
      else if (!!maybeTs?.seconds)
        tx[s] = convertTimestamp(maybeTs)
    })
  }
}

const convertETransfer = (et: any) => {
  if (et) {
    et.cad = new Decimal(et.cad);
    et.recieved = DateTime.fromISO(et.recieved);
  }
}
const convertBank = (tx: any) => {
  if (tx)
    tx.Date = DateTime.fromISO(tx.Date);
}
const convertBlockchain = (tx: any) => {
  if (tx) {
    tx.date = DateTime.fromISO(tx.date);
    tx.completed = tx.completed ? DateTime.fromISO(tx.completed) : undefined;
  }
}
