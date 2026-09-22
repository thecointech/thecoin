import { DateTime } from 'luxon';
import type { HarvestData, HarvestDelta } from './types';
import { ContractCore } from '@thecointech/contract-core';
import { loadAndMergeHistory } from '@thecointech/tx-blockchain';
import { log } from '@thecointech/logging';
import { PayVisaAmountKey, PayVisaKey } from './steps/PayVisa';
import { getDemoCheckpoint, type DemoCheckpoint } from '@thecointech/scraper/testDemoAccountEmulation';


export function reconcileDemoState(state: HarvestDelta, checkpoint: DemoCheckpoint): HarvestDelta {
  const stepData: Record<string, string> = {
    ...state.stepData,
  };
  if (checkpoint.visa.dueAmount.value > 0) {
    stepData[PayVisaKey] = checkpoint.visa.dueDate.toISO()!;
    stepData[PayVisaAmountKey] = String(checkpoint.visa.dueAmount.value);
  }
  else {
    delete stepData[PayVisaKey];
    delete stepData[PayVisaAmountKey];
  }

  return {
    ...state,
    harvesterBalance: checkpoint.visa.balance,
    toPayVisa: checkpoint.pendingPayment?.amount,
    toPayVisaDate: checkpoint.pendingPayment?.date,
    stepData,
  };
}

export async function reconcileDemoStateIfNeeded(lastRun: HarvestData|undefined, address: string, tcCore: Awaited<ReturnType<typeof ContractCore.get>>) {
  // Do not run this if it's only been a few days since the last run.
  if (lastRun) {
    const daysSinceLastRun = DateTime.now()
      .diff(lastRun.date, 'days')
      .days;
    if (daysSinceLastRun < 4.5) {
      return lastRun.state;
    }
  }
  log.warn("Last run is stale, updating local state...");
  const lastState = lastRun?.state ?? {};

  const initBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0", 10);
  const history = await loadAndMergeHistory(initBlock, tcCore, address);
  const lastDeposit = history.filter(tx => tx.change > 0).at(-1);

  if (!lastDeposit) {
    log.warn("No recent deposit found, returning last state");
    return lastState;
  }
  // If we are here, we don't have a recent run, but we do have a deposit to reconcile
  const lastTx = lastDeposit.date;
  // If there are no transactions in more than a week, don't force it.
  // Do a proper re-initialization.
  const daysSinceSettlement = DateTime.now()
    .diff(lastTx, 'days')
    .days;
  if (daysSinceSettlement > 8) {
    throw new Error("Harvester is too far out-of-date, cannot reconcile.  Please run `initDemoAccount` to update the demo account.");
  }
  const checkpoint = getDemoCheckpoint(lastTx);
  log.warn(`Reconciling demo harvester state through ${lastTx.toISO()}`);
  return reconcileDemoState(lastState, checkpoint);
}
