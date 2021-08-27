import { log } from "@thecointech/logging";
import { RbcApi } from "@thecointech/rbcapi";
import { TheCoin } from '@thecointech/contract';
import { processUnsettledDeposits } from './deposits';
import { processUnsettledETransfers } from './etransfer';
import { getIncompleteActions } from '@thecointech/broker-db';
import { SendMail } from '@thecointech/email';
import { initialize } from './initialize';

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
async function ProcessBillPayments() {
  log.debug("Processing Bill Payments");
  let incomplete = await getIncompleteActions("Bill");
  log.debug(`You need to settle: ${incomplete.length} bill payments`);
  if (incomplete.length > 0) {
    SendMail('You have bills to settle', incomplete.map(p => p.data.date.toSQLDate()).join("\n"));
  }
}


async function Process() {
  const contract = await initialize();
  const bank = new RbcApi();
  await ProcessDeposits(contract, bank);
  await ProcessETransfers(contract, bank);
  await ProcessBillPayments();

  log.debug(` --- Completed processing --- `);
}
Process();
