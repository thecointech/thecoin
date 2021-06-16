import { getIncompleteActions } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract';
import { Processor } from '@thecointech/tx-processing/etransfer';

export async function processUnsettledETransfers(contract: TheCoin)
{
  let incomplete = await getIncompleteActions("Sell");
  const processor = Processor(contract);

  const resumedActions = incomplete.map(async ic => {
    return processor.execute(null, ic);
  })

  return Promise.all(resumedActions);
}
