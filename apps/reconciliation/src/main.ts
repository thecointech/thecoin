import { init as LogInit, log } from "@the-coin/logging";
import { RbcApi, RbcStore } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { init } from "@the-coin/utilities/firestore";
import { verify } from "./verify";
import { readCache, writeCache } from "./cache";
import { fetchAllRecords } from "./fetch";
import { matchAll, writeMatched } from "./match";
import { AllData } from "types";

async function initialize() {

  LogInit("fetch-transactions");
  log.debug(' --- Initializing matching  --- ');

  ConfigStore.initialize();
  RbcStore.initialize();
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

  const original = JSON.parse(JSON.stringify(data)) as AllData
  const match = matchAll(data);
  verify(match, data, original);
  writeMatched(match);
}
Process();
