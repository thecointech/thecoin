import { IBank } from '@thecointech/bank-interface';
import { getIncompleteActions } from '@thecointech/broker-db';
import type { TheCoin } from '@thecointech/contract-core';
import { Processor } from '@thecointech/tx-bill';
import type { TypedActionContainer } from '@thecointech/tx-statemachine';

export async function processUnsettledBillPayments(contract: TheCoin, bank: IBank)
{
  let incomplete = await getIncompleteActions("Bill");
  const processor = Processor(contract, bank);

  const r: TypedActionContainer<"Bill">[] = []
  for (const action of incomplete) {
    const executed = await processor.execute(null, action);
    r.push(executed);
  }
  return r;
}
