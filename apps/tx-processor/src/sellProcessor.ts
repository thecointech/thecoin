import { AnyAction, getIncompleteActions, isType } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract-core/*';
import { RbcApi } from '@thecointech/rbcapi';
import { Processor as BillProcessor } from '@thecointech/tx-bill';
import { Processor as PluginProcessor } from '@thecointech/tx-plugins';
import { Processor as ETransferProcessor } from '@thecointech/tx-etransfer';
import { AnyActionContainer } from '@thecointech/tx-statemachine';
import { log } from '@thecointech/logging';

export async function processPayments(tcCore: TheCoin, bank: RbcApi) {
  log.debug('Processing All Payments');

  let bills = await getIncompleteActions("Bill");
  let plugins = await getIncompleteActions("Plugin");
  let etransfers = await getIncompleteActions("Sell");

  const allActions = [
    ...bills,
    ...plugins,
    ...etransfers,
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
    const ex = ETransferProcessor(tcCore, bank);
    return await ex.execute(null, action);
  }
  else {
    throw new Error(`Unknown action type: ${action.type}`);
  }
}
