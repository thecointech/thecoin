import { init as LogInit, log } from "@the-coin/logging";
import { RbcApi, RbcStore } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { init } from "@the-coin/utilities/firestore";
import { verify } from "./verify";
import { readCache, writeCache } from "./cache";
import { fetchAllRecords } from "./fetch";
import { matchAll, writeMatched } from "./match";
import rbc_secret from './rbc.secret.json';

async function initialize() {

  LogInit("fetch-transactions");
  log.debug(' --- Initializing matching  --- ');

  ConfigStore.initialize();
  RbcStore.initialize();
  RbcApi.SetCredentials(rbc_secret);
  await init();

  log.debug('Init Complete');
}

async function Process() {
  await initialize();
  const rbc = new RbcApi();
  let forceReInit = false;
  let data = forceReInit ? null: readCache();
  if (!data) {
    data = await fetchAllRecords(rbc);
    writeCache(data);
  }

  // remove duplicates
  const {eTransfers} = data;
  data.eTransfers = eTransfers.filter((et, index) =>
    eTransfers.findIndex(etd => etd.id == et.id) === index
  )

  const match = matchAll(data);
  verify(match, data);
  writeMatched(match);
}
Process();
