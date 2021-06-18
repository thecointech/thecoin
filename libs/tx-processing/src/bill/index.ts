import { getIncompleteActions } from "@thecointech/broker-db";
import { StateMachineProcessor } from "../statemachine";
import { graph } from "./graph";
import type { TheCoin } from '@thecointech/contract';
import type { RbcApi } from '@thecointech/rbcapi';

export const Processor = (contract: TheCoin, bank: RbcApi|null = null) => new StateMachineProcessor(graph, contract, bank);

export async function processUnsettledBillPayments(contract: TheCoin)
{
  let incomplete = await getIncompleteActions("Bill");
  const processor = Processor(contract);

  const resumedActions = incomplete.map(async ic => {
    return processor.execute(null, ic);
  })

  return Promise.all(resumedActions);
}
