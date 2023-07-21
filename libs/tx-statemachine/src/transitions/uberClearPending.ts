import { makeTransition  } from '../makeTransition';
import { TransitionCallback } from '../types';
import { verifyPreTransfer } from './verifyPreTransfer';
import { connectConverter } from '@thecointech/contract-plugin-converter';
import { calculateOverrides, convertBN, toDelta } from './coinUtils';
import { log } from '@thecointech/logging';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';

// this deposit can operate on both bill & sell types.
type BSActionTypes = "Bill"|"Sell";
//
// Remove from incomplete listings.
export const uberClearPending = makeTransition<BSActionTypes>("uberClearPending", async (container) =>
  await verifyPreTransfer(container) ?? await doClearPending(container)
)

const doClearPending: TransitionCallback<BSActionTypes> = async (container) => {

  const signer = container.contract.signer;
  const uc = await connectConverter(signer);

  const request = container.action.data.initial;
  // Certified transfer should not end up here!
  if (isCertTransfer(request.transfer)) {
    throw new Error("Cannot deposit certified transfer");
  }

  const { from, to, transferMillis } = request.transfer;
  const overrides = await calculateOverrides(container, uberClearPending);
  log.debug({address: from}, `Processing pending from {address} with overrides ${JSON.stringify(overrides, convertBN)}`);
  const tx = await uc.processPending(from, to, transferMillis, overrides);
  return toDelta(tx);
};
