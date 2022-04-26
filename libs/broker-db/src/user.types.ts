
import { buildConverter, convertDates } from './converter';
import { DateTime } from 'luxon';

export type StatusType = "incomplete"|"waiting"|"approved"|"inreview"|"rejected";

export type UserVerifiedInfo = {
  // The UniqueID of the individual.  For now, this is
  // hash(given name, family name, DOB).  This should be
  // sufficient for detecting duplicate accounts for
  // quite a while.
  uniqueId?: string;
  // When setting the uniqueID, we also sign it with
  // BrokerTransferAssistant.  This info is also stored
  // by the user in
  uniqueIdSig?: string;
  // The current status of the user.
  status: StatusType;
  // the date when status was (last) set
  statusUpdated: DateTime;
  // external user ID, can be used to view the user within blockpass (recordId)
  externalId: string;
	// verified: string,
	// verifiedDate: DateTime,
}
export type ReferralData = {
  created: DateTime,
  referredBy: string,
}
// A union of all possible data on a user.
export type AllUserData = Partial<UserVerifiedInfo&ReferralData>

export const userDataConverter = buildConverter<AllUserData>(
  convertDates<AllUserData>("created", "statusUpdated")
);
