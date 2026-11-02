
import { buildConverter, convertDates } from '../converter';
import { DateTime } from 'luxon';
import type { BasicDetails } from '@thecointech/account-details/types';
import { DocumentReference } from '@thecointech/firestore';
import type { BlockpassStatus } from '@thecointech/blockpass/types';

// Store an anonymous identity for a user, this allows us to check online
// whether an identity matches an existing identity.
export type UserIdentity = {
  // The status of the user in Blockpass
  // Kept for completeness, but the system uses
  // KYC status for a non-BP dependent workflow
  blockpassStatus?: BlockpassStatus;
  // A user may have multiple accounts
  linkedAccounts?: DocumentReference[];
}

export type ReferralData = {
  created: DateTime,
  referredBy: string,
}
// A union of all possible data on a user.
export type AllUserData = Partial<UserIdentity&BasicDetails&ReferralData>

export const userDataConverter = buildConverter<AllUserData>(
  convertDates<AllUserData>("created", "kycUpdated")
);
