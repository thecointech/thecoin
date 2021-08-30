import dotenv from 'dotenv'
dotenv.config({path: process.env.DOTENV_CONFIG_PATH});

import { RbcStore, RbcApi } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { initBrowser } from "@the-coin/rbcapi/action";
import { init } from '@the-coin/utilities/firestore'
import { AllData, fetchAllRecords, matchAll, readDataCache, verify, writeDataCache, writeReconciledCache } from "@the-coin/tx-reconciliation";
import { init as LogInit, log } from "@the-coin/logging";

const DATA_CACHE_NAME = "port.raw.cache"
const RECONCILED_CACHE_NAME = "port.reconciled.cache"

async function initialize() {

  LogInit("tx-fetch");
  ConfigStore.initialize();
  await init();
}


var doFetch = true;
async function getData() {
  if (doFetch) {

    RbcStore.initialize();
    await initBrowser({
      headless: false
    })

    const rbcApi = new RbcApi();
    const rawData = await fetchAllRecords(rbcApi);
    writeDataCache(rawData, DATA_CACHE_NAME);
    return rawData;
  }
  else {
    const rawData = readDataCache(DATA_CACHE_NAME);
    if (!rawData) throw new Error('asdf');
    return rawData;
  }
}

declare global {
  var raw: AllData;
  var source: AllData;
}

async function updateCache() {
  await initialize();

  log.debug("Initialization complete");

  const rawData = await getData();
  log.debug("Fetched raw complete");

  globalThis.raw = rawData;
  globalThis.source = readDataCache(DATA_CACHE_NAME)!;

  const reconciled = await matchAll(rawData);
  log.debug("Reconciliation complete");
  for (const user of reconciled) {
    user.data = rawData.userData[user.address];
  }
  writeReconciledCache(reconciled, RECONCILED_CACHE_NAME);

  await verify(reconciled, rawData);

  // Write out the result

}

updateCache();
