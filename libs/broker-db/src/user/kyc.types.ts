import { KycRecord } from "@thecointech/account-details/types";
import { DateTime } from "luxon";
import { buildConverter, convertDates } from "../converter";

export type KycHistory = {
  record: KycRecord;
  created: DateTime;
}

// Base KYC doc doesn't actually convert anything, but this
// makes the type checker happy when we use it as a converter
export const kycDocConverter = buildConverter<KycRecord>();

export const kycHistoryConverter = buildConverter<KycHistory>(
  convertDates("created"),
);
