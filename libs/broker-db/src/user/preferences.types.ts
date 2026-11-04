import { EncryptedBlob } from "@thecointech/account-details/types";
import { DateTime } from "luxon";
import { buildConverter, convertDates } from "../converter";

export type Preferences = {
  blob: EncryptedBlob;
  updated: DateTime;
  // Simple abuse counter, reset each (local) day
  dayWrites: number;
}

export const preferencesConverter = buildConverter<Preferences>(
  convertDates("updated"),
);
