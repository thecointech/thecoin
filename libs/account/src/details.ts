import type { BasicDetails, UserPreferences } from "@thecointech/account-details/types";

export type AccountDetails = {
  basic?: BasicDetails;
  preferences: UserPreferences;
  // True once preferences are in sync with the broker (fetched & decrypted,
  // or confirmed none are stored).  Runtime-only: never persisted locally,
  // so a stale local copy can't overwrite newer remote preferences.
  preferencesLoaded?: boolean;
}
