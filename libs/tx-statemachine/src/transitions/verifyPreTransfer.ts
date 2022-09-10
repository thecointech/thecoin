import { AnyActionContainer, getCurrentState } from "../types";
import { preTransfer } from './pretransfer';

//
// When running a transfer, we need to be able to handle problems caused by
// errors/sudden disconects mid-transfer.  We do this by transitioning into
// a pre-transfer state prior to the transfer, then when actioning the state
//
export const verifyPreTransfer = (container: AnyActionContainer) => {
  const state = getCurrentState(container);
  // was our last state a pre-transfer?
  if (state.delta.type != preTransfer.transitionName)
    return { error: 'Running transfer without matching pre-transfer' };

  // How long ago was it registered?
  const age = state.delta.created.diffNow();
  if (age.as('seconds') < -120) { // 2 minutes ago
    return { error: 'Timeout from pre-transfer'}
  }
  return false;
}
