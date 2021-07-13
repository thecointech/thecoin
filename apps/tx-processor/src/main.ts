import { log } from "@thecointech/logging";
import { init as FirestoreInit } from '@thecointech/firestore';
import { RbcStore, initBrowser, RbcApi } from "@thecointech/rbcapi";
import { ConfigStore } from "@thecointech/store";
import { getSigner } from '@thecointech/signers';
import { ConnectContract, TheCoin } from '@thecointech/contract';
import { processUnsettledDeposits } from './deposits';
import { processUnsettledETransfers } from './etransfer';

async function initialize() {

  FirestoreInit();
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
async function ProcessDeposits(contract: TheCoin, bank: RbcApi) {
  log.debug("Processing Deposits");
  const deposits = await processUnsettledDeposits(contract, bank);
  log.debug(`Processed ${deposits.length} deposits`);
  return deposits;
}

async function ProcessETransfers(contract: TheCoin, bank: RbcApi) {
  log.debug("Processing eTransfers");
  const eTransfers = await processUnsettledETransfers(contract, bank);
  log.debug(`Processed ${eTransfers.length} eTransfers`);
}

async function Process() {
  const contract = await initialize();
  const bank = new RbcApi();
  await ProcessDeposits(contract, bank);
  await ProcessETransfers(contract, bank);
  log.debug(` --- Completed processing --- `);
}
Process();
