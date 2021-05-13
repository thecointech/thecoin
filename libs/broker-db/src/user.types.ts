
import { buildConverter } from 'converter';
import { DateTime } from 'luxon';

export type UserVerifiedInfo = {
	verified: string,
	verifiedTimestamp: DateTime;
}
export type ReferralData = {
  created: DateTime;
  referredBy: string;
}
// A union of all possible data on a user.
export type AllUserData = Partial<UserVerifiedInfo&ReferralData>

export const userDataConverter = buildConverter<AllUserData>(["created", "verifiedTimestamp"]);
