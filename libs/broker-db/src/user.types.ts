
import { buildConverter, convertDates } from './converter';
import { DateTime } from 'luxon';

export type StatusType =
  "started"| // Button clicked in UI.  Starts polling
  "incomplete"| // Submission started, but not finished
  "waiting"| // Submission uploaded to BP
  "approved"| // Approved within BP
  "inreview"|
  "rejected"|
  "completed"; // Data pulled into users IDX DB & removed from local

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

  // raw data.  We will temporarily store user data on our servers to ensure
  // the user can reliably pull the data.  Because there is a 4-hop trip, it
  // is too risky to pull the data from BlockPass with no certainty it'll arrive
  // where it's meant to be.
  raw: any;

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
