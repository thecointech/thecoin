import { getIncompleteActions } from '@thecointech/broker-db';
import type { TheCoin } from '@thecointech/contract-core';
import gmail from '@thecointech/tx-gmail';
import { eTransferProcessor, getBuyETransferAction } from '@thecointech/tx-deposit';
import { TypedActionContainer } from '@thecointech/tx-statemachine';
import type { IBank } from '@thecointech/bank-interface';
import { log } from '@thecointech/logging';

export async function processUnsettledDeposits(contract: TheCoin, bank: IBank)
{
  const raw = await gmail.queryNewDepositEmails();

  // Get all incomplete actions, to ensure that we finish
  // processing (even if data is no longer present in email list)
  let incomplete = await getIncompleteActions("Buy");

  const processor = eTransferProcessor(contract, bank);

  const processed: TypedActionContainer<"Buy">[] = []
  // Process each raw deposit.
  for (const eTransfer of raw) {
    try {
      log.info({ initialId: eTransfer.id }, 'Processing eTransfer {initialId}');
      const action = await getBuyETransferAction(eTransfer);
      // Subtract from our list of incomplete
      incomplete = incomplete.filter(i => i.doc.path != action.doc.path);
      const r = await processor.execute(eTransfer, action);
      processed.push(r);
    }
    catch (err: any) {
      // Do not let a failed transaction derail the whole party
      log.error(err, 'Error processing deposit {initialId}', { initialId: eTransfer.id });
    }
  }

  // If we do not have eTransfer info, we cannot deposit
  // into our bank.  However, assuming we previously made
  // the deposit, we can complete the rest.
  // (NOTE: the name is a bit misleading, because an
  // action may be resumed by a raw eTransfer.  This is only
  // to resume incomplete actions for which we no longer have email)
  for (const ic of incomplete) {
    try {
      log.info({ initialId: ic.data.initialId }, 'Resuming eTransfer {initialId}');
      processed.push(
        await processor.execute(null, ic)
      );
    }
    catch (err: any) {
      log.error(err, 'Error resuming deposit {initialId}', { initialId: ic.data.initialId });
    }
  }
  return processed;
}
