import { log } from '@thecointech/logging';
import { RbcApi } from '@thecointech/rbcapi';
// import type { TheCoin } from '@thecointech/contract-core';
import { SendMail } from '@thecointech/email';
import { exit } from 'process';
// import { processUnsettledDeposits } from './deposits';
import { initialize, release } from './initialize';
import { processReferrals } from './referrals';
import { processTransfers } from './transfers';

//
// Process deposits: Make 'em Rain!!!
// async function ProcessDeposits(contract: TheCoin, bank: RbcApi) {
//   log.debug('Processing Deposits');
//   const deposits = await processUnsettledDeposits(contract, bank);
//   log.debug(`Processed ${deposits.length} deposits`);
//   return deposits;
// }

async function Process() {
  const contract = await initialize();
  const bank = new RbcApi();
  // await ProcessDeposits(contract, bank);
  await processTransfers(contract, bank);
  await processReferrals();

  log.debug('Completed processing');
}

async function run() {
  try {
    log.info('Running tx-processor');
    await Process();
    log.info('Completed running tx-processor');
  } catch (e: any) {
    log.fatal(e);
    const msent = await SendMail(`tx-processor ${e.message}`, `${e.message}\n${e.stack}`);
    log.info(`Email notification sent: ${msent}`);
  } finally {
    await release();
    // I have been unable to figure out why we still have handles open
    await new Promise((resolve) => setTimeout(resolve, 5000));
    exit(0);
  }
}
run();
