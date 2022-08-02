
// Lightweight KYC data, suitable for use in app.
// This can be edited by the user to allow updating
// simple information such as phone number/email address
// without requiring full KYC again.  However, we'll
// need to figure out how we can manage verified details

import { CurrencyCode } from "@thecointech/fx-rates";
import { StatusType } from "@thecointech/broker-cad";

//----------------------------------------------
// Legally verifiable details.  Each block
// of data is signed by TheCoin to prove we
// verified it: signatures are individual to
// allow a user to update them separately.
export type AccountKYCUser = {

  // First, Last, date-of-birth of client
  family_name?: string;
  given_name?: string;
  DOB?: string;

  // email of client
  email?: string;
}

// home address
export type AccountKYCAddress = {
  address?: string;
  extraInfo?: string;
  country?: string,
  postalCode?: string,
  state?: string,
  city?: string,
}

export type AccountKYCPhone = {
  countryCode?: string,
  countryCode2?: string,
  phoneNumber?: string,
  number?: string,
}

export type AccountKYC = {
  user?: AccountKYCUser;
  // Our UniqueID: hash(toLower(given + family + DOB)).
  // This is a uniqueness value used for proving individuality.
  // A copy is stored (and signed) on the TC servers
  // uniqueId?: string;
  uniqueIdSig?: string; // Signed by TC to prove authenticity
  // We do not store the uniqueId.  The hash can be computed
  // by our data, which when combined with sig on-server proves
  // our identity data is legit.

  address?: AccountKYCAddress;
  // TheCoin's signature that `{country postalCode state city address extraInfo}` is legit;
  addressSig?: string;

  phone?: AccountKYCPhone;
  phoneVerified?: boolean;
  // TheCoins's sig that `{phoneNumber}` is legit
  phoneSig?: string;

  // Status of KYC
  status?: StatusType;
  statusUpdated?: number;
}

// Where have we persisted this account to?
export type AccountStorage = {
  storedOffline?: boolean;
  storedOnGoogle?: boolean,
  storedOnDropbox?: boolean,
  storedOnOneDrive?: boolean,
}

// However, we will need to validate this data against
export type AccountDetails = AccountKYC & AccountStorage & {
  //----------------------------------------------
  // unsigned (not-legally-important) details

  // Store our referral code here.  It's just more convenient than
  // pinging the server every time we want to view it.
  referralCode?: string;

  // Which currency to display by default
  displayCurrency?: CurrencyCode;

  // Display language
  language?: string;
}
