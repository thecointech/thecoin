import { type AnyAction, getIncompleteActions, isType } from '@thecointech/broker-db';
import type { TheCoin } from '@thecointech/contract-core';
import type { RbcApi } from '@thecointech/rbcapi';
import { Processor as BillProcessor } from '@thecointech/tx-bill';
import { Processor as PluginProcessor } from '@thecointech/tx-plugins';
import { Processor as WithdrawalProcessor } from '@thecointech/tx-etransfer';
import { queryNewDepositEmails } from '@thecointech/tx-gmail';
import { type AnyActionContainer, getCurrentState } from '@thecointech/tx-statemachine';
import { log } from '@thecointech/logging';
import { getBuyETransferAction, eTransferProcessor as DepositProcessor } from '@thecointech/tx-deposit';
import type { AnyTransfer } from '@thecointech/types';
import { isUberTransfer } from '@thecointech/utilities/UberTransfer'

type DatedAction = AnyAction & { executeDate: number };

export async function processTransfers(tcCore: TheCoin, bank: RbcApi) {
  log.debug('Processing All Transfers');

  const allActions = await fetchTransfers();
  const results = await processActions(allActions, tcCore, bank);

  const completed = results.filter(a => getCurrentState(a).name == 'complete');
  log.info(
    {
      total: allActions.length,
      completed: completed.length,
      skipped: results.length - completed.length
    },
    `Processed {total} transactions, completed {completed}, skipped {skipped}`
  );
  return results;
}


async function fetchTransfers() {
  let bills = await getIncompleteActions("Bill");
  let plugins = await getIncompleteActions("Plugin");
  let etransfers = await getIncompleteActions("Sell");
  let purchases = await getAllPurchaseActions();
  const allActions = [
    ...bills.map(b => ({ ...b, executeDate: getWithdrawDate(b.data.initial.transfer) })),
    ...plugins.map(b => ({ ...b, executeDate: b.data.initial.signedAt.toMillis() })),
    ...etransfers.map(b => ({ ...b, executeDate: getWithdrawDate(b.data.initial.transfer) })),
    ...purchases.map(b => ({ ...b, executeDate: b.data.date.toMillis() })),
  ];
  allActions.sort((a, b) => a.executeDate - b.executeDate);
  return allActions;
}

export async function processActions(allActions: DatedAction[], tcCore: TheCoin, bank: RbcApi) {
  const r: AnyActionContainer[] = [];

  const usersWithFailedTxs = new Set<string>();

  // TODO!  https://github.com/thecointech/thecoin/issues/558
  for (const action of allActions) {
    if (usersWithFailedTxs.has(action.address)) {
      log.debug({ initialId: action.data.initialId, date: action.executeDate, address: action.address }, "Skipping {initialId} for {address} due to prior failure");
      continue;
    }
    try {
      const executed = await processAction(action, tcCore, bank);
      r.push(executed);


      // If the last transition resulted in an error, mark the
      // user as having a failed transaction
      const state = getCurrentState(executed);
      if (state.name == 'error' || state.name == 'requestManual' || state.delta.error) {
        log.error(
          { initialId: action.data.initialId, type: action.type, err: state.delta.error, address: action.address },
          'Detected error in action {type} from {address}'
        );
        // Always process deposits.
        if (action.type !== 'Buy') {
          usersWithFailedTxs.add(action.address);
        }
      }
      else {
        log.trace({ initialId: action.data.initialId, type: action.type, address: action.address },
          'Finished processing action {type} from {address}');
      }
    }
    catch (err: any) {
      // Prevent this user from continuing processing
      log.error({ initialId: action.data.initialId, err }, 'Unknown error processing {initialId}', );
      usersWithFailedTxs.add(action.address);
    }
  }

  return r;
}


async function processAction(action: DatedAction, tcCore: TheCoin, bank: RbcApi) {
  log.debug({ initialId: action.data.initialId, type: action.type, date: action.executeDate, address: action.address }, "Processing {type} from {date}: {initialId}");
  if (isType(action, 'Bill')) {
    const ex = BillProcessor(action.data.initial.transfer, tcCore, bank);
    return await ex.execute(null, action);
  }
  else if (isType(action, "Plugin")) {
    const ex = PluginProcessor(tcCore);
    return await ex.execute(null, action);
  }
  else if (isType(action, "Sell")) {
    const ex = WithdrawalProcessor(tcCore, bank);
    return await ex.execute(null, action);
  }
  else if (isType(action, "Buy")) {
    const ex = DepositProcessor(tcCore, bank);
    return await ex.execute(action.data.initial.raw, action);
  }
  else {
    throw new Error(`Unknown action type: ${action.type}`);
  }
}


async function getAllPurchaseActions() {
  let incomplete = await getIncompleteActions("Buy");

  const raw = await queryNewDepositEmails();

  let purchases = [];

  for (const eTransfer of raw) {
    const action = await getBuyETransferAction(eTransfer);
    // Subtract from our list of incomplete if it's already there
    incomplete = incomplete.filter(i => i.doc.path != action.doc.path);
    purchases.push(action);
  }
  return [
    ...incomplete,
    ...purchases,
  ]
}

const getWithdrawDate = (req: AnyTransfer) =>
  isUberTransfer(req)
    ? req.signedMillis
    : req.timestamp;
