import { getIncompleteActions } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract';
import { fetchNewDepositEmails } from '@thecointech/tx-gmail';
import { Processor, getBuyAction } from '@thecointech/tx-processing/deposit';
import { RbcApi } from '@thecointech/rbcapi';

export async function processUnsettledDeposits(contract: TheCoin, bank: RbcApi)
{
  const raw = await fetchNewDepositEmails();

  // Get all incomplete actions, to ensure that we finish
  // processing (even if data is no longer present in email list)
  let incomplete = await getIncompleteActions("Buy");

  const processor = Processor(contract, bank);

  // Process each raw deposit.
  const rawActions = raw.map(async eTransfer => {
    const action = await getBuyAction(eTransfer);
    // Subtract from our list of incomplete
    incomplete = incomplete.filter(i => i.doc.path != action.doc.path);
    return processor.execute(eTransfer, action);
  })

  // If we do not have eTransfer info, we cannot deposit
  // into our bank.  However, assuming we previously made
  // the deposit, we can complete the rest.
  // (NOTE: the name is a bit misleading, because an
  // action may be resumed by a raw eTransfer.  This is only
  // to resume incomplete actions for which we no longer have email)
  const resumedActions = incomplete.map(async ic => {
    return processor.execute(null, ic);
  })

  return Promise.all([
    ...rawActions,
    ...resumedActions,
  ]);
}
