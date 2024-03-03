import { AnyAction, getIncompleteActions, isType } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract-core/*';
import { RbcApi } from '@thecointech/rbcapi';
import { Processor as BillProcessor } from '@thecointech/tx-bill';
import { Processor as PluginProcessor } from '@thecointech/tx-plugins';
import { Processor as WithdrawalProcessor } from '@thecointech/tx-etransfer';
import { AnyActionContainer } from '@thecointech/tx-statemachine';
import { log } from '@thecointech/logging';
import gmail from '@thecointech/tx-gmail';
import { getBuyETransferAction, eTransferProcessor as DepositProcessor } from '@thecointech/tx-deposit';

export async function processTransfers(tcCore: TheCoin, bank: RbcApi) {
  log.debug('Processing All Transfers');

  let bills = await getIncompleteActions("Bill");
  let plugins = await getIncompleteActions("Plugin");
  let etransfers = await getIncompleteActions("Sell");
  let purchases = await getAllPurchaseActions();
  const allActions = [
    ...bills,
    ...plugins,
    ...etransfers,
    ...purchases,
  ];
  allActions.sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());

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
  log.debug(`Processed ${r.length} payments`);
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
    log.info({ initialId: eTransfer.id }, 'Processing eTransfer {initialId}');
    const action = await getBuyETransferAction(eTransfer);

    // Subtract from our list of incomplete
    incomplete = incomplete.filter(i => i.doc.path != action.doc.path);
    purchases.push(action);
  }
  return [
    ...incomplete,
    ...purchases,
  ]
}
