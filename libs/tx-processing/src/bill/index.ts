import { getIncompleteActions } from "@thecointech/broker-db";
import { StateMachineProcessor } from "statemachine";
import { graph } from "./graph";
import { TheCoin } from '@thecointech/contract';

export const Processor = (contract: TheCoin) => new StateMachineProcessor(graph, contract);

export async function processUnsettledBillPayments(contract: TheCoin)
{
  let incomplete = await getIncompleteActions("Bill");
  const processor = Processor(contract);

  const resumedActions = incomplete.map(async ic => {
    return processor.execute(null, ic);
  })

  return Promise.all(resumedActions);
}
