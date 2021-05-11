import { getIncompleteActions } from "@thecointech/broker-db";
import { StateMachineProcessor } from "statemachine";
import { graph } from "./graph";
import { TheCoin } from '@thecointech/contract';

export async function processUnsettledETransfers(contract: TheCoin)
{
  let incomplete = await getIncompleteActions("Sell");
  const processor = new StateMachineProcessor(graph, contract);

  const resumedActions = incomplete.map(async ic => {
    return processor.execute(null, ic);
  })

  return Promise.all(resumedActions);
}
