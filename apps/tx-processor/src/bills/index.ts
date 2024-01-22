import type { IBank } from '@thecointech/bank-interface';
import { getIncompleteActions } from '@thecointech/broker-db';
import { Processor } from '@thecointech/tx-bill';
import { TypedActionContainer } from '@thecointech/tx-statemachine';
import type { TheCoin } from '@thecointech/contract-core';

export async function processUnsettledBillPayments(contract: TheCoin, bank: IBank)
{
  let incomplete = await getIncompleteActions("Bill");

  const r: TypedActionContainer<"Bill">[] = [];
  for (const action of incomplete) {
    const processor = Processor(action.data.initial.transfer, contract, bank);
    const executed = await processor.execute(null, action);
    r.push(executed);
  }
  return r;
}
