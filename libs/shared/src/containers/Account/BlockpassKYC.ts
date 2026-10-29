import { call } from "@redux-saga/core/effects";
import { log } from '@thecointech/logging';
import { fetchBasicDetails } from './details';
import type { SagaIterator } from '@redux-saga/core';
import type { AccountState } from '@thecointech/account';
import type { BasicDetails } from '@thecointech/account-details';

// KYC is complete once approved, and the referral process has resolved
export const isKycComplete = (basic?: BasicDetails) =>
  basic?.status === "approved" && !!basic.referralStatus && basic.referralStatus !== "pending";

// Check the broker for an updated KYC status.  Returns the new
// basic details if they have changed, otherwise undefined.
export function* checkCurrentStatus(state: AccountState, forceVerify?: boolean): SagaIterator<BasicDetails | undefined> {
  const current = state.details.basic;
  if (!forceVerify && isKycComplete(current))
    return undefined;

  const basic: BasicDetails | undefined = yield call(fetchBasicDetails, state.signer);
  // Nothing on the broker yet (eg, KYC started locally but not yet submitted)
  if (!basic)
    return undefined;

  const changed = basic.status !== current?.status
    || basic.referralStatus !== current?.referralStatus
    || basic.referralCode !== current?.referralCode;
  if (!changed)
    return undefined;

  log.trace({ address: state.address }, `Updating {address} with new KYC status: ${basic.status}`);
  return basic;
}
