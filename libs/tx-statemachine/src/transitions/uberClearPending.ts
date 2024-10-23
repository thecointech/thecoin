import { makeTransition  } from '../makeTransition';
import { TransitionCallback, getCurrentState } from '../types';
import { verifyPreTransfer } from './verifyPreTransfer';
import { connectConverter } from '@thecointech/contract-plugin-converter';
import { toDelta } from './coinUtils';
import { log } from '@thecointech/logging';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';
import { getSigner } from '@thecointech/signers';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";
//
// Remove from incomplete listings.
export const uberClearPending = makeTransition<BSActionTypes>("uberClearPending", async (container) =>
  await verifyPreTransfer(container) ?? await doClearPending(container)
)

const doClearPending: TransitionCallback<BSActionTypes> = async (container) => {

  // It doesn't matter who the signer is, the function is public
  // (they just need to have some $$$ available)
  const signer = await getSigner("BrokerCAD");
  const uc = await connectConverter(signer);

  const request = container.action.data.initial;
  // Certified transfer should not end up here!
  if (isCertTransfer(request.transfer)) {
    throw new Error("Cannot deposit certified transfer");
  }

  // If we already have a coin balance, it may be that the original
  // UberTransfer completed immediately.  In this case, there is no need to do anything
  const currentState = getCurrentState(container)
  if (currentState.data.coin?.isPositive()) {
    log.error(
      { initialId: container.action.data.initialId },
      "Cannot clear pending, already have coin balance"
    )
    return {};
  }

  const { from, to, transferMillis } = request.transfer;
  log.debug({address: from}, `Processing pending from {address}`);
  const tx = await uc.processPending(from, to, transferMillis);
  return toDelta(tx);
};
