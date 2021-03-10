import dotenv from 'dotenv'
dotenv.config({path: process.env.DOTENV_CONFIG_PATH});

import { signIn } from "@the-coin/tx-processing";
import { init as LogInit, log } from "@the-coin/logging";
import { RbcStore, RbcApi } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { getContract } from '@the-coin/utilities/blockchain';
import { initBrowser } from "@the-coin/rbcapi/action";
import type { TheCoin } from '@the-coin/contract';
import { ProcessUnsettledDeposits } from "@the-coin/tx-processing/deposit/service";
import { processUnsettledETransfers } from "@the-coin/tx-processing/etransfer/service";

async function initialize() {

  LogInit("tx-processor");
  log.debug(' --- Initializing processing --- ');

  RbcStore.initialize();
  ConfigStore.initialize();

  const contract = await getContract('BrokerCAD');
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }

  await initBrowser({
    headless: false
  })

  await signIn()

  log.debug('Init Complete');
  const rbcApi = new RbcApi();

  return { contract, rbcApi };
}

//
// Process deposits: Make 'em Rain!!!
//
async function ProcessDeposits(rbcApi: RbcApi, contract: TheCoin) {
  log.debug("Processing Deposits");
  const deposits = await ProcessUnsettledDeposits(contract, rbcApi);
  log.debug(`Processed ${deposits.length} deposits`);
  return deposits;
}

async function ProcessETransfers(rbcApi: RbcApi) {
  log.debug("Processing eTransfers");
  const eTransfers = await processUnsettledETransfers(rbcApi);
  log.debug(`Processed ${eTransfers.length} eTransfers`);
}

async function Process() {
  const { contract, rbcApi } = await initialize();
  await ProcessDeposits(rbcApi, contract);
  await ProcessETransfers(rbcApi);
  log.debug(` --- Completed processing --- `);
}
Process();
