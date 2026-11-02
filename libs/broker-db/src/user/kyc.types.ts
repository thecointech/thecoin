import { KycRecord } from "@thecointech/account-details/types";
import { DateTime } from "luxon";
import { buildConverter, convertDates } from "../converter";

export type KycHistory = {
  record: KycRecord;
  // To keep a record of uniqueness online, we keep a signed(uniqueId)
  // This indicates uniqueness while preserving privacy
  // A null value indicates missing data in the KYC record
  uniqueIdSig: string|null;
  created: DateTime;
}

export type KycCurrent = {
  uniqueIdSig: string;
} & KycRecord;

// Base KYC doc doesn't actually convert anything, but this
// makes the type checker happy when we use it as a converter
export const kycDocConverter = buildConverter<KycCurrent>();

export const kycHistoryConverter = buildConverter<KycHistory>(
  convertDates("created"),
);
