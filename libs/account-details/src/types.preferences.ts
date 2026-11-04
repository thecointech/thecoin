import type { CurrencyCode } from "@thecointech/fx-rates";

// User-only preferences.  Encrypted to their
// account, unreadable by anyone else.
export type UserPreferences = {
  // The name of the account, set on first account creation
  accountName?: string;

  //----------------------------------------------
  // Where has the user persisted their account?
  storedOffline?: boolean;
  storedOnGoogle?: boolean;
  storedOnDropbox?: boolean;
  storedOnOneDrive?: boolean;

  //----------------------------------------------
  // Preferences
  displayCurrency?: CurrencyCode;
  language?: string;

  // Stored favourite bill payees.
  favouritePayees?: Payee[];
}

export type Payee = {
  // Needs to match payee list
  name: string;
  // or account number.
  accountId: string;
}
