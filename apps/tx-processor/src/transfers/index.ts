import { AnyAction, getIncompleteActions, isType } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract-core/*';
import { RbcApi } from '@thecointech/rbcapi';
import { Processor as BillProcessor } from '@thecointech/tx-bill';
import { Processor as PluginProcessor } from '@thecointech/tx-plugins';
import { Processor as WithdrawalProcessor } from '@thecointech/tx-etransfer';
import { AnyActionContainer, getCurrentState } from '@thecointech/tx-statemachine';
import { log } from '@thecointech/logging';
import gmail from '@thecointech/tx-gmail';
import { getBuyETransferAction, eTransferProcessor as DepositProcessor } from '@thecointech/tx-deposit';
import { AnyTransfer } from '@thecointech/types';
import { isUberTransfer } from '@thecointech/utilities/UberTransfer'

export async function processTransfers(tcCore: TheCoin, bank: RbcApi) {
  log.debug('Processing All Transfers');

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

  const r: AnyActionContainer[] = [];

  for (const action of allActions) {
    try {
      const executed = await processAction(action, tcCore, bank);
      r.push(executed);
    }
    catch (e: any) {
      // Do not let a failed transaction derail the whole party
      log.error(e, 'Unknown error processing {initialId}', { initialId: action.data.initialId });
    }
  }

  const completed = r.filter(a => getCurrentState(a).name == 'complete');
  log.info(`Processed ${allActions.length} transactions, completed ${completed.length}`);
  return r;
}

async function processAction(action: AnyAction, tcCore: TheCoin, bank: RbcApi) {
  if (isType(action, 'Bill')) {
    log.debug({ initialId: action.data.initialId }, "Processing Bill: {initialId}");
    const ex = BillProcessor(action.data.initial.transfer, tcCore, bank);
    return await ex.execute(null, action);
  }
  else if (isType(action, "Plugin")) {
    log.debug({ initialId: action.data.initialId }, "Processing Plugin: {initialId}");
    const ex = PluginProcessor(tcCore);
    return await ex.execute(null, action);
  }
  else if (isType(action, "Sell")) {
    log.debug({ initialId: action.data.initialId }, "Processing Withdrawal: {initialId}");
    const ex = WithdrawalProcessor(tcCore, bank);
    return await ex.execute(null, action);
  }
  else if (isType(action, "Buy")) {
    if (action.history.length == 0) {
      log.info({ initialId: action.data.initialId }, "Processing Deposit: {initialId}");
    }
    else {
      log.info({ initialId: action.data.initialId }, "Resuming Deposit: {initialId}");
    }
    const ex = DepositProcessor(tcCore, bank);
    return await ex.execute(action.data.initial.raw, action);
  }
  else {
    throw new Error(`Unknown action type: ${action.type}`);
  }
}

async function getAllPurchaseActions() {
  let incomplete = await getIncompleteActions("Buy");

  const raw = await gmail.queryNewDepositEmails();

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
