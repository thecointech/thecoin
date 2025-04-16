import Decimal from 'decimal.js-light';;
import { writeFileSync, mkdirSync, existsSync, readFileSync, statSync } from "fs";
import { DateTime } from "luxon";
import { join } from "path";
import { AllData, Reconciliations } from "./types";
import {log} from '@thecointech/logging';

export const cacheFullPath = (path?: string) =>
  path ?? process.env["USERDATA_CACHE_PATH"] ?? "/temp/UserData/Cache";
const DATA_CACHE_NAME = 'data.cache.json';
const RECONCILED_CACHE_NAME = 'reconciled.cache.json';

export const writeDataCache = (data: AllData, cacheName?: string, path?: string) =>
  writeCache(data, cacheName ?? DATA_CACHE_NAME, path);
export const writeReconciledCache = (data: Reconciliations, cacheName?: string, path?: string) =>
  writeCache(data, cacheName ?? RECONCILED_CACHE_NAME, path);

function writeCache(data: AllData|Reconciliations, cacheName: string, path?: string) {
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

export const isDataCacheValid = () => isCacheValid(DATA_CACHE_NAME)
export const isReconciledCacheValid = () => isCacheValid(RECONCILED_CACHE_NAME)
export const isCacheValid = (cacheName: string, path?: string) => {
  const cachePath = cacheFullPath(path);
  const filePath = join(cachePath, cacheName);
  try {
    const stat = statSync(filePath);
    if (stat.mtime.toDateString() == new Date().toDateString())
      return true;
  }
  catch (err) { }
  return false;
}

/////////////////////////////////////////////////////////
export const readDataCache = (cacheName?: string, path?: string) =>
  readCache<AllData>(cacheName ?? DATA_CACHE_NAME, path);
export const readReconciledCache = (cacheName?: string, path?: string) =>
  readCache<Reconciliations>(cacheName ?? RECONCILED_CACHE_NAME, path);

function readCache<T>(cacheName: string, path?: string): T|null {
  const cachePath = cacheFullPath(path);
  const filePath = join(cachePath, cacheName);
  if (existsSync(filePath)) {
    const asText = readFileSync(filePath, 'utf8');
    const asJson = JSON.parse(asText, converter);
    log.debug(`Read cache from ${filePath}`);
    return asJson as T;
  }
  log.debug(`Cache not found at: ${filePath}`);
  return null;
}

// export function convertDataFromJson(asJson: any) {
//   const asData = asJson as AllData;
//   convertData(asData);
//   return asData;
// }

// export function convertReconciledFromJson(asJson: any) {
//   const asReconciled = asJson as Reconciliations;
//   convertData(asReconciled);
//   return asReconciled;
// }

/////////////////////////////////////////////////////////

const mkCachePath = (path?: string) => {
  const cachePath = cacheFullPath(path);
  if (!existsSync(cachePath)) {
    try {
      mkdirSync(cachePath, { recursive: true });
    }
    catch(err: unknown) {
      if (err instanceof Error) {
        log.error(err, `Cannot make cache path: ${path}`);
      }
      throw err;
    }
  }
  return cachePath;
}

const isNumeric = (str: string) => /^\d+(\.\d+)?$/.test(str)
const converter = (_key: string, value: string) => {
  if (typeof value == "string") {
    if (isNumeric(value))
      return new Decimal(value);
    const d = DateTime.fromISO(value);
    if (d.isValid)
      return d;
  }
  return value;
}
