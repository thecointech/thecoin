import { Timestamp } from "@thecointech/firestore";
import Decimal from "decimal.js-light";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { AllData, Reconciliations } from "./types";
import {log} from '@thecointech/logging';

// file deepcode ignore no-any: JSON processing is basically all 'any'

export const cacheFullPath = (path?: string) =>
  path ?? process.env["USERDATA_CACHE_PATH"] ?? "/temp/UserData/Cache";
const DATA_CACHE_NAME = 'data.cache.json';
const RECONCILED_CACHE_NAME = 'reconciled.cache.json';


export const writeDataCache = (data: AllData, cacheName?: string, path?: string) =>
  writeCache(data, cacheName ?? DATA_CACHE_NAME, path);
export const writeReconciledCache = (data: Reconciliations, cacheName?: string, path?: string) =>
  writeCache(data, cacheName ?? RECONCILED_CACHE_NAME, path);

function writeCache(data: AllData|Reconciliations, cacheName: string, path?: string) {
  //const sanitized = sanitize(data);
  const cachePath = mkCachePath(path);
  const filePath = join(cachePath, cacheName);
  writeFileSync(
    filePath,
    JSON.stringify(data)
  );
  log.debug(`Wrote cache to ${filePath}`);
  return true;
}

/////////////////////////////////////////////////////////

export const readDataCache = (cacheName?: string, path?: string) =>
  readCache(convertDataFromJson, cacheName ?? DATA_CACHE_NAME, path);
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

export function convertDataFromJson(asJson: any) {
  const asData = asJson as AllData;
  asData.eTransfers.forEach(convertETransfer)
  asData.bank.forEach(convertBank)
  asData.blockchain.forEach(convertBlockchain)

  const convertAction = (col: any) =>
    Object.values(col).forEach(
      (txs: any) => txs.forEach(convertTimestamps)
    );

  convertAction(asData.dbs.Buy);
  convertAction(asData.dbs.Sell);
  convertAction(asData.dbs.Bill);

  return asData;
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
  }
  return asReconciled;
}

/////////////////////////////////////////////////////////

const mkCachePath = (path?: string) => {
  const cachePath = cacheFullPath(path);
  if (!existsSync(cachePath)) {
    try {
      mkdirSync(cachePath, { recursive: true });
    }
    catch(err) {
      log.error(err);
      throw err;
    }
  }
  return cachePath;
}

const convertTimestamp = (obj: any) =>
  obj
    ? Timestamp.fromMillis(obj._seconds * 1000 + obj._nanoseconds / 100000)
    : undefined;
const convertTimestamps = (tx: any) => {
  if (tx) {
    Object.entries(tx).forEach(([s, v]) => {
      const maybeTs : any = v;
      if (!!maybeTs?._seconds)
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
