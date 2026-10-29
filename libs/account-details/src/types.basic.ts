import type { DateTime } from "luxon";
import type { StatusType } from "./types.kyc";


//
// Basic details about the account.  Stored in plain-text
// in the database.  Does not contain PII.
export type BasicDetails = {
  // To keep a record of uniqueness online, we keep a signed(uniqueId)
  // This keeps uniqueness while preserving privacy even if the DB leaks
  // This is probably sufficient as BrokerTransferAssist is (very) well guarded
  // uniqueIdSig?: string;
  // The current status of the user.
  status: StatusType;
  // the date when status was (last) set
  statusUpdated: DateTime;

  // Record the referral code for easy reference by the client
  referralCode?: string;
  // Progress of assigning a referral code (set once KYC is approved)
  referralStatus?: ReferralStatus;
}

export type ReferralStatus =
  "pending"|   // Approved, awaiting referral code assignment
  "assigned"|  // Referral code assigned
  "duplicate"; // Identity matches an existing user, no code assigned
