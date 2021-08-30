import dotenv from 'dotenv'
dotenv.config({path: process.env.DOTENV_CONFIG_PATH});

import { signIn, InitContract } from "@the-coin/tx-processing";
import { init as LogInit, log } from "@the-coin/logging";
import { RbcStore, RbcApi } from "@the-coin/rbcapi";
import { ConfigStore } from "@the-coin/store";
import { getWallet } from '@the-coin/utilities/Wallets';
import { initBrowser } from "@the-coin/rbcapi/action";
// import { ProcessUnsettledDeposits } from "@the-coin/tx-processing/deposit/service";
import { processUnsettledETransfers } from "@the-coin/tx-processing/etransfer/service";
import { OfflineFxRates } from "@the-coin/tx-processing/base/fxrates";
import { FetchUnsettledRecords } from "@the-coin/tx-processing/base";
import { SendMail } from '@the-coin/email';
import { exit } from 'process';

async function initialize() {

  LogInit("tx-processor");
  log.debug(' --- Initializing processing --- ');

  RbcStore.initialize();
  ConfigStore.initialize();

  const wallet = await getWallet('BrokerCAD');
  if (!wallet) {
    throw new Error("Couldn't load wallet'");
  }

  const contract = await InitContract(wallet);
  if (!contract) {
    throw new Error("Couldn't initialize contract")
  }

  await initBrowser({
    headless: false
  })

  await signIn()

  log.debug('Init Complete');
}

//
// Process deposits: Make 'em Rain!!!
//
async function ProcessDeposits(_rbcApi: RbcApi) {
  log.debug("Not Processing Deposits");
  // const deposits = await ProcessUnsettledDeposits(rbcApi);
  // log.debug(`Processed ${deposits.length} deposits`);
  //return deposits;
}

async function ProcessETransfers(rbcApi: RbcApi) {
  log.debug("Processing eTransfers");
  const eTransfers = await processUnsettledETransfers(rbcApi);
  log.debug(`Processed ${eTransfers.length} eTransfers`);
}

async function ProcessBillPayments() {
  log.debug("Processing Bill Payments");

  const fxRates = new OfflineFxRates();
  const toSettle = await FetchUnsettledRecords('Bill', fxRates);

  log.debug(`You need to settle: ${toSettle.length} bill payments`);
  if (toSettle.length > 0) {
    SendMail('You have bills to settle', toSettle.map(p => p.recievedTimestamp.toDate()).join("\n"));
  }
}

async function Process() {
  await initialize();
  const rbcApi = new RbcApi();
  await ProcessDeposits(rbcApi);
  await ProcessETransfers(rbcApi);

  await ProcessBillPayments();
  log.debug(` --- Completed processing --- `);

  // Force exit to release open file handles
  exit(0)
}
Process();
