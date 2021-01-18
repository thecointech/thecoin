import { Timestamp } from "@the-coin/utilities/firestore";
import Decimal from "decimal.js-light";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { AllData } from "./types";
import {log} from '@the-coin/logging';

export const cacheFullPath = (path?: string) =>
  path ?? process.env["USERDATA_CACHE_PATH"] ?? "/temp/UserData/Cache";
export const cacheFilePath = (folder: string, name?: string) =>
  join(folder, name ?? 'data.cache.json');

export function writeCache(data: AllData, cacheName?: string, path?: string) {
  //const sanitized = sanitize(data);
  const cachePath = cacheFullPath(path);
  if (!existsSync(cachePath)) {
    try {
      mkdirSync(cachePath, { recursive: true });
    }
    catch(err) {
      log.error(err);
      return false;
    }
  }
  const filePath = cacheFilePath(cachePath, cacheName);
  writeFileSync(
    filePath,
    JSON.stringify(data)
  );
  log.debug(`Wrote cache to ${filePath}`);
  return true;
}

export function readCache(cacheName?: string, path?: string) {
  const cachePath = cacheFullPath(path);
  const filePath = cacheFilePath(cachePath, cacheName);
  if (existsSync(filePath)) {
    const asText = readFileSync(filePath, 'utf8');
    const asJson = JSON.parse(asText);

    log.debug(`Read cache from ${filePath}`);

    return convertFromJson(asJson)
  }
  log.debug(`Cache not found at: ${filePath}`);
  return null;
}

export function convertFromJson(asJson: any) {
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

  Object.values(asJson.obsolete).forEach((txs: any) => {
    txs.forEach((tx: any) => {
      tx.completed = convertTimestamp(tx.completed) ?? convertTimestamp(tx.completedTimestamp);
      tx.recieved = convertTimestamp(tx.recieved) ?? convertTimestamp(tx.recievedTimestamp);
      tx.settled = convertTimestamp(tx.settled) ?? convertTimestamp(tx.processedTimestamp);
    })
  })

  return asJson as AllData;

}
