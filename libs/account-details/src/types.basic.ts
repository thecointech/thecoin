import type { DateTime } from "luxon";
// import type { BlockpassStatus } from "@thecointech/blockpass/types";


//
// Basic details about the account.  Stored in plain-text
// in the database.  Does not contain PII.
export type BasicDetails = {
  // The current status of the user in Blockpass
  // blockpassStatus: BlockpassStatus;
  // the date when kyc was (last) set
  kycUpdated?: DateTime;

  // What stage of the KYC process we're in
  kycStage?: KycStage;
  // Set to "updating" when KYC is being processed
  // Allows us to catch and handle cases where KYC errors in-progress
  kycLock?: "updating" | "complete" | "failed";

  // Record the referral code for easy reference by the client
  referralCode?: string;
  // Referral code status
  referralStatus?: ReferralStatus;
}

// Referral status.  An account may be ineligible if it is linked to another account
// that already has a referral code.
export type ReferralStatus = "pending" | "active" | "ineligible";


export type KycStage =
  | "started" // KYC process has been started, but not yet approved in blockpass
  | "reviewing" // User has submitted KYC, waiting for approval in blockpass
  | "approved" // KYC approved in blockpass
  | "rejected" // Account rejected in blockpass (for whatever reason)
  // The following statuses can be triggered after user approval in Blockpass
  | "reviewIdentityChange" // KYC approved but identity fields missing, needs manual review
  | "reviewDataMissing" // KYC approved but identity fields missing, needs manual review
  | "reviewDuplicate"  // Identity may match an existing user, needs manual review
  // The following statuses are final
  | "suspended" // Account suspended (for whatever reason)
  | "complete"; // KYC completed, final status
