
import { buildConverter, convertDates } from '../converter';
import { DateTime } from 'luxon';
import type { BasicDetails } from '@thecointech/account-details/types';

// Store an anonymous identity for a user, this allows us to check online
// whether an identity matches an existing identity.
export type UserIdentity = {
  // Seed: on the off chance a duplciate uniqueIdSig/referralCode is recorded,
  // we could use this seed as a de-duplifier
  // NOTE: This is not implemented yet!
  seed?: string;

  // To keep a record of uniqueness online, we keep a signed(uniqueId)
  // This keeps uniqueness while preserving privacy even if the DB leaks
  // This is probably sufficient as BrokerTransferAssist is (very) well guarded
  uniqueIdSig: string;
}

export type ReferralData = {
  created: DateTime,
  referredBy: string,
}
// A union of all possible data on a user.
export type AllUserData = Partial<UserIdentity&BasicDetails&ReferralData>

export const userDataConverter = buildConverter<AllUserData>(
  convertDates<AllUserData>("created", "statusUpdated")
);
