import { BasicDetails } from "types.basic";

export * from "./types";
export * from "./kyc";
export * from "./preferences";
export * from "./encryptionKey";


// KYC is complete once approved, and the referral process has resolved
export const isKycComplete = (basic?: BasicDetails) =>
    basic?.kycStage === "approved" ||
    basic?.kycStage === "complete"

export const isReferralComplete = (basic?: BasicDetails) =>
  !!basic?.referralStatus &&
  basic?.referralStatus !== "pending"
