
// Lightweight KYC data, suitable for use in app.
// This can be edited by the user to allow updating
// simple information such as phone number/email address
// without requiring full KYC again.  However, we'll
// need to figure out how we can manage verified details

import { CurrencyCode } from "@the-coin/utilities";

// However, we will need to validate this data against
export type AccountDetails = {

  //----------------------------------------------
  // Legally verifiable details.  Each block
  // of data is signed by TheCoin to prove we
  // verified it: signatures are individual to
  // allow a user to update them separately.
  // Each signature is salted with account
  // ethereum address to enforce uniqueness

  // First & Last name of client
  family_name?: string;
  given_name?: string;
  // TheCoin's signature that `{ethAddress given_name family_name}` is legit;
  nameDOBSig?: string;

  // home address
  address?: {
    country?: string,
    postalCode?: string,
    state?: string,
    city?: string,
    address?: string;
  };
  // TheCoin's signature that `{ethAddress country postalCode state city address}` is legit;
  addressSig?: string;

  // date of birth
  DOB?: string;
  // TheCoins's sig that `{ethAddress DOB}` is legit
  DOBSig?: string;

  // phone number
  phone?: {
    countryCode?: string,
    countryCode2?: string,
    phoneNumber?: string,
    number?: string,
  };
  // TheCoins's sig that `{ethAddress phoneNumber}` is legit
  phoneSig?: string;

  //----------------------------------------------
  // unsigned (not-legally-important) details

  // email of client
  email?: string;
  
  // Where have we persisted this account to?
  storedOnGoogle?: boolean,
  storedOnDropbox?: boolean,
  storedOnOneDrive?: boolean,

  // Which currency to display by default
  displayCurrency: CurrencyCode;

  // Display language
  language?: string;
}
