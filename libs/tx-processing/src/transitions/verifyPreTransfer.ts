import { ActionContainer, getCurrentState } from "statemachine/types";

//
// When running a transfer, we need to be able to handle problems caused by
// errors/sudden disconects mid-transfer.  However,
export const verifyPreTransfer = (container: ActionContainer) => {

  const state = getCurrentState(container);
  // was our last state a pre-transfer?
  if (state.state != 'pretransfer')
    return { error: 'Running transfer without matching per-transfer' };

  // How long ago was it registered?
  const age = state.delta.timestamp.diffNow();
  if (age.as('seconds') > 120) {
    return { error: 'Timeout from pre-transfer'}
  }
  return null;
}
