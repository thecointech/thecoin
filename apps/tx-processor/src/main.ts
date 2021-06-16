import { init as LogInit, log } from "@thecointech/logging";
import { RbcStore } from "@thecointech/rbcapi";
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/accounts';
import { initBrowser } from "@thecointech/rbcapi";
import { ConnectContract, TheCoin } from '@thecointech/contract';
import { processUnsettledDeposits } from './deposits';
import { processUnsettledETransfers } from './etransfer';

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

  log.debug('Init Complete');
  return contract;
}

//
// Process deposits: Make 'em Rain!!!
//
async function ProcessDeposits(contract: TheCoin) {
  log.debug("Processing Deposits");
  const deposits = await processUnsettledDeposits(contract);
  log.debug(`Processed ${deposits.length} deposits`);
  return deposits;
}

async function ProcessETransfers(contract: TheCoin) {
  log.debug("Processing eTransfers");
  const eTransfers = await processUnsettledETransfers(contract);
  log.debug(`Processed ${eTransfers.length} eTransfers`);
}

async function Process() {
  const contract = await initialize();
  await ProcessDeposits(contract);
  await ProcessETransfers(contract);
  log.debug(` --- Completed processing --- `);
}
Process();
