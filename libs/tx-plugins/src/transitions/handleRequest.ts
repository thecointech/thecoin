import { verifyPreTransfer } from "@thecointech/tx-statemachine/transitions";
import { TransitionCallback, makeTransition } from '@thecointech/tx-statemachine';
import { assignPlugin } from '@thecointech/contract-plugins/assign';
import { removePlugin } from '@thecointech/contract-plugins/remove';
import { AssignPluginRequest, RemovePluginRequest } from '@thecointech/types';
import { calculateOverrides, toDelta } from '@thecointech/tx-statemachine/transitions/coinUtils';

const isAssign = (request: AssignPluginRequest|RemovePluginRequest) : request is AssignPluginRequest => !!(request as AssignPluginRequest).plugin;

//
// Set/Remove a plugin
export const handleRequest = makeTransition<"Plugin">("handleRequest", async (container) =>
  await verifyPreTransfer(container) ?? await doHandleRequest(container)
);

const doHandleRequest: TransitionCallback<"Plugin"> = async (container) => {
  const request = container.action.data.initial;
  const overrides = await calculateOverrides(container, handleRequest);
  const tx = isAssign(request)
    ? await assignPlugin(container.contract, request, overrides)
    : await removePlugin(container.contract, request, overrides);

  return toDelta(tx);
}
