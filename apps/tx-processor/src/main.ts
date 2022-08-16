import { log } from "@thecointech/logging";
import { RbcApi } from "@thecointech/rbcapi";
import type { TheCoin } from '@thecointech/contract-core';
import { processUnsettledDeposits } from './deposits';
import { processUnsettledETransfers } from './etransfer';
import { processUnsettledBillPayments } from './bills';
import { SendMail } from '@thecointech/email';
import { initialize, release } from './initialize';

import { exit } from 'process';
import { processReferrals } from './referrals';

//
// Process deposits: Make 'em Rain!!!
async function ProcessDeposits(contract: TheCoin, bank: RbcApi) {
  log.debug("Processing Deposits");
  const deposits = await processUnsettledDeposits(contract, bank);
  log.debug(`Processed ${deposits.length} deposits`);
  return deposits;
}

//
// Process withdrawals: Still Raining!
async function ProcessETransfers(contract: TheCoin, bank: RbcApi) {
  log.debug("Processing eTransfers");
  const eTransfers = await processUnsettledETransfers(contract, bank);
  log.debug(`Processed ${eTransfers.length} eTransfers`);
}

//
// Get notified if you need to address something
async function ProcessBillPayments(contract: TheCoin, bank: RbcApi) {
  log.debug("Processing Bill Payments");
  const billPayments = await processUnsettledBillPayments(contract, bank);
  log.debug(`Processed ${billPayments.length} bill payments`);
}

async function Process() {
  const contract = await initialize();
  const bank = new RbcApi();
  await ProcessDeposits(contract, bank);
  await ProcessETransfers(contract, bank);
  await ProcessBillPayments(contract, bank);

  await processReferrals();

  log.debug(`Completed processing`);
}

async function run() {
  try {
    await Process();
  }
  catch(e: any) {
    log.fatal(e);
    const msent = await SendMail(`tx-processor ${e.message}`, `${e.message}\n${e.stack}`);
    log.info("Email notification sent: " + msent);
  }
  finally {
    await release();
    // I have been unable to figure out why we still have handles open
    await new Promise(resolve => setTimeout(resolve, 5000));
    exit(0);
  }
}
run();

