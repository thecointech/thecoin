import { validateAction } from './CertifiedActionVerify';
import { createAction } from '@thecointech/broker-db';
import { DateTime } from 'luxon';
import { Processor } from "@thecointech/tx-processing/bill";
import { GetContract } from './Wallet';
import { getCurrentState } from '@thecointech/tx-processing/statemachine';
import { SendMail } from '@thecointech/email';
import { log } from '@thecointech/logging';
import { CertifiedTransfer } from '@thecointech/types';

export async function  ProcessBillPayment(sale: CertifiedTransfer) {
  const user = sale.transfer.from;
  const initialId = sale.signature;
  log.trace({user, initialId }, `Initiating bill from {user} with initialId {initialId}`);
  await validateAction(sale);

  // First, create/register the action
  const action = await createAction(user, "Bill", {
    initial: sale,
    date: DateTime.now(),
    initialId: sale.signature
  })

  // Process the sale
  const contract = await GetContract();
  const processor = Processor(contract);
  const container = await processor.execute(null, action, "tcWaiting");
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
