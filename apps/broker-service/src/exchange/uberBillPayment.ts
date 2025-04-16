import { validateUberAction } from './CertifiedActionVerify';
import { TypedAction, createAction, getIncompleteActions } from '@thecointech/broker-db';
import { DateTime } from 'luxon';
import { UberProcessor } from "@thecointech/tx-bill";
import { GetContract } from '../signer/Wallet';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { SendMail } from '@thecointech/email';
import { log } from '@thecointech/logging';
import type { UberTransferAction } from '@thecointech/types';
import { NormalizeAddress } from '@thecointech/utilities';

export async function  ProcessUberBillPayment(sale: UberTransferAction) {
  const user = sale.transfer.from;
  const initialId = sale.signature;
  log.trace({user, initialId }, `Initiating UberBill from {user} with initialId {initialId}`);
  await validateUberAction(sale);

  // First, create/register the action
  const action = await createAction(user, "Bill", {
    initial: sale,
    date: DateTime.now(),
    initialId: sale.signature
  })
  log.trace({ActionId: action.doc.id, initialId }, 'Created action {ActionId} for initialId {initialId}');

  // Process the sale
  const result = await processAction(action)
  // For now, keep sending the emails on every transaction.
  SendMail(`Coin Sell`, `${user} processed states:\n
      ${action.history.map(h => h.type).join('\n')}\n
       => ${result.state}`
  );
  return result;
}

async function processAction(action: TypedAction<"Bill">) {
  const contract = await GetContract();
  const plugins = await contract.getUsersPlugins(action.address);
  // We can only process this transaction if the user has plugins
  if (plugins.length === 0) {
    log.info("No plugins found, skipping execute");
    return {
      state: "intitial",
      hash: ""
    };
  }

  // We need to resolve all actions in-order.  This means we cannot process
  // this action until all pending actions are resolved
  const pending = await hasPendingTransactions(action.address, action.data.initialId);
  if (pending) {
    log.info("Pending transactions found, skipping execute")
    return {
      state: "intitial",
      hash: ""
    };
  }

  const processor = UberProcessor(contract);
  const container = await processor.execute(null, action, "tcRegisterWaiting");
  const latestState = getCurrentState(container);
  return {
    state: latestState.name,
    hash: latestState.data.hash
  }
}

async function hasPendingTransactions(address: string, filterOutId: string) {
  const bills = await getIncompleteActions("Bill");
  const sales = await getIncompleteActions("Sell");
  const normalizedAddress = NormalizeAddress(address);
  // We don't need "buy"/"plugin" as those actions are not initiated by client address
  const allActions = [...bills, ...sales]
    .filter(a => a.data.initialId !== filterOutId)
    .map(a => NormalizeAddress(a.address));
  return allActions.some(a => a === normalizedAddress);
}


