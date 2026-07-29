import { log } from '@thecointech/logging';
import { RbcApi } from '@thecointech/rbcapi';
import { exit } from 'process';
import { initialize, release } from './initialize';
import { processReferrals } from './referrals';
import { processTransfers } from './transfers';
import { verifyBank } from './verifyBank';
import { monitorHarvest } from './monitorHarvest';
import { sleep } from '@thecointech/async';

const STREAM_CLOSE_GRACE_PERIOD_MS = 5000;

async function Process() {
  const contract = await initialize();
  const bank = await RbcApi.create();
  await verifyBank(bank);
  await processTransfers(contract, bank);
  await processReferrals();

  log.debug('Completed processing');
}

async function run() {
  let exitCode = 0;
  try {
    await Process();
    log.info('Completed running tx-processor');
  } catch (e: any) {
    // We should have already logged every error prior to this,
    // but just in case...
    log.fatal(e);
    exitCode = 1;
  } finally {

    // Always try to run monitoring, it doesn't matter if it fails,
    // but we want it to occur if possible, even if the
    // the processing fails.
    try {
      await monitorHarvest();
    } catch (e) {
      log.error(e, 'Failed to monitor harvest');
    }

    try {
      await release();
    }
    catch (e) {
      log.error(e, 'Failed to release resources');
      console.error('Failed to release resources:', e);
      exitCode = 2;
    }
    try {
      // Flush all logger streams to ensure buffered logs are sent to SEQ
      await log.end();
      // We may have open handles, give them a moment to close
      await sleep(STREAM_CLOSE_GRACE_PERIOD_MS);
      // Final logs can only go to the console.
      console.log("Flushed logs, exiting");
    } catch (e) {
      // If flushing fails, log the error but still exit
      console.error('Failed to flush logger streams:', e);
      exitCode = 2;
    }
    exit(exitCode);
  }
}
run();
