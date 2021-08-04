import { getIncompleteActions } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract';
import { Processor } from '@thecointech/tx-etransfer';
import { RbcApi } from '@thecointech/rbcapi';

export async function processUnsettledETransfers(contract: TheCoin, bank: RbcApi)
{
  let incomplete = await getIncompleteActions("Sell");
  const processor = Processor(contract, bank);

  const resumedActions = incomplete.map(async ic => {
    return processor.execute(null, ic);
  })

  return Promise.all(resumedActions);
}
