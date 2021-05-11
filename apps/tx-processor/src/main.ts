import dotenv from 'dotenv'
dotenv.config({path: process.env.DOTENV_CONFIG_PATH});

import { signIn } from "@thecointech/tx-processing";
import { init as LogInit, log } from "@thecointech/logging";
import { RbcStore, RbcApi } from "@thecointech/rbcapi";
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/accounts';
import { initBrowser } from "@thecointech/rbcapi/action";
import { ConnectContract, TheCoin } from '@thecointech/contract';
import { processUnsettledDeposits, processUnsettledETransfers } from "@thecointech/tx-processing";

async function initialize() {

  LogInit("tx-processor");
  log.debug(' --- Initializing processing --- ');

  RbcStore.initialize();
  ConfigStore.initialize();

  const signer = await getSigner('BrokerCAD');
  const contract = await ConnectContract(signer);
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
  const deposits = await processUnsettledDeposits(contract, rbcApi);
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
