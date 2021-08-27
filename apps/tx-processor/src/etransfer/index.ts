import { getIncompleteActions } from '@thecointech/broker-db';
import { TheCoin } from '@thecointech/contract';
import { Processor } from '@thecointech/tx-etransfer';
import { RbcApi } from '@thecointech/rbcapi';
import type { TypedActionContainer } from '@thecointech/tx-statemachine';

export async function processUnsettledETransfers(contract: TheCoin, bank: RbcApi)
{
  let incomplete = await getIncompleteActions("Sell");
  const processor = Processor(contract, bank);

  const r: TypedActionContainer<"Sell">[] = []
  for (const action of incomplete) {
    const executed = await processor.execute(null, action);
    r.push(executed);
  }
  return r;
}
