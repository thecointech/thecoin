import { signIn, InitContract } from "@the-coin/tx-processing";
import { init as LogInit, log } from "@the-coin/logging";
import { RbcStore, RbcApi } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { GetWallet } from './wallet';
import { initBrowser } from "@the-coin/rbcapi/action";
import rbc_secret from './rbc.secret.json';
import { GetDepositsToProcess, ProcessUnsettledDeposit } from "@the-coin/tx-processing/deposit/service";
import { processUnsettledETransfers } from "@the-coin/tx-processing/etransfer/service";

async function initialize() {

  LogInit("tx-processor");
  log.debug(' --- Initializing processing --- ');

  RbcStore.initialize();
  ConfigStore.initialize();

  const wallet = await GetWallet();
  if (!wallet) {
    throw new Error("Couldn't load wallet'");
  }

  const contract = await InitContract(wallet);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }

  RbcApi.SetCredentials(rbc_secret);
  await initBrowser({
    headless: false
  })

  await signIn()

  log.debug('Init Complete');
}

//
// Process deposits: Make 'em Rain!!!
//
async function ProcessDeposits(rbcApi: RbcApi) {
  log.debug("Processing Deposits");
  const deposits = await GetDepositsToProcess();

  // for each email, we immediately try and deposit it.
  for (const deposit of deposits)
  {
    deposit.isComplete = await ProcessUnsettledDeposit(deposit, rbcApi);
    log.debug("Deposit Completed: " + deposit.isComplete);
  }

  log.debug(`Processed ${deposits.length} deposits`);
  return deposits;
}

async function ProcessETransfers(rbcApi: RbcApi) {
  log.debug("Processing eTransfers");
  const eTransfers = await processUnsettledETransfers(rbcApi);
  log.debug(`Processed ${eTransfers.length} eTransfers`);
}

async function Process() {
  await initialize();
  const rbcApi = new RbcApi();
  await ProcessDeposits(rbcApi);
  await ProcessETransfers(rbcApi);
  log.debug(` --- Completed processing --- `);
}
Process();
