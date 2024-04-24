import { validateAction } from './CertifiedActionVerify';
import { CertifiedTransfer } from '@thecointech/types';
import { Processor, getSellAction } from "@thecointech/tx-etransfer";
import { GetContract } from '../signer/Wallet';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { SendMail } from '@thecointech/email';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';

export async function  ProcessSale(sale: CertifiedTransfer) {
  const user = sale.transfer.from;
  const initialId = sale.signature;
  log.trace({user, initialId }, `Initiating sale from {user} with initialId {initialId}`);
  await validateAction(sale);

  // First, create/register the action
  const action = await getSellAction(sale, DateTime.now());

  // Process the sale
  const contract = await GetContract();
  const processor = Processor(contract);
  const container = await processor.execute(null, action, "tcWaiting");
  const latestState = getCurrentState(container);

  // For now, keep sending the emails on every transaction.
  SendMail(`Coin Sell`, `${container.action.address} processed states:\n
      ${container.history.map(h => h.delta.type).join('\n')}\n
       => ${latestState.name} - ${latestState.data.hash}`
  );
  return {
    state: latestState.name,
    hash: latestState.data.hash
  }
}
