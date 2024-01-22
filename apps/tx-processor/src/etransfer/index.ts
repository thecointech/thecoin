import type { IBank } from '@thecointech/bank-interface';
import { getIncompleteActions } from '@thecointech/broker-db';
import type { TheCoin } from '@thecointech/contract-core';
import { Processor } from '@thecointech/tx-etransfer';
import type { TypedActionContainer } from '@thecointech/tx-statemachine';

export async function processUnsettledETransfers(contract: TheCoin, bank: IBank)
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
