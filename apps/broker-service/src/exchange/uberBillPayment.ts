import { validateUberAction } from './CertifiedActionVerify';
import { createAction } from '@thecointech/broker-db';
import { DateTime } from 'luxon';
import { UberProcessor } from "@thecointech/tx-bill";
import { GetContract } from './Wallet';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { SendMail } from '@thecointech/email';
import { log } from '@thecointech/logging';
import type { UberTransferAction } from '@thecointech/types';

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

  log.trace({ActionId: action.doc.id, initialId }, 'Created action {ActionID} for initialId {initialId}');

  // Process the sale
  const contract = await GetContract();
  const processor = UberProcessor(contract);
  const container = await processor.execute(null, action, "tcRegisterWaiting");
  const latestState = getCurrentState(container);

  // For now, keep sending the emails on every transaction.
  SendMail(`Coin Sell`, `${container.action.address} processed states:\n
      ${action.history.map(h => h.type).join('\n')}\n
       => ${latestState.name}`
  );
  return {
    state: latestState.name,
    hash: latestState.data.hash
  }
}
