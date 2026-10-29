import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { getFirestore, CollectionReference, DocumentReference } from '@thecointech/firestore';
import { KycRecord } from "@thecointech/account-details/types";
import { kycDocConverter, KycHistory, kycHistoryConverter } from "./kyc.types";
import { Preferences, preferencesConverter } from "./preferences.types";
import { AllUserData, userDataConverter } from "./basic.types";

// Layout:
//   /User/{addr}                          - basic user data
//   /User/{addr}/details/preferences      - user preferences (encrypted to user)
//   /User/{addr}/details/kyc              - current KYC record (encrypted to BrokerCAD)
//   /User/{addr}/details/kyc/history/{ts} - immutable KYC records (encrypted to BrokerCAD)

//
// Collection of all users
export function getUserCollection() : CollectionReference<AllUserData> {
  return getFirestore().collection("User").withConverter(userDataConverter);
}

//
// get single user document
export function getUserDoc(address: string) : DocumentReference<AllUserData> {
  if (!IsValidAddress(address)) {
    console.error(`${address} is not a valid address`);
    throw new Error("Invalid address");
  }
  return getUserCollection().doc(NormalizeAddress(address));
}

// Details collection
export function getDetailsCollection(address: string) {
  return getUserDoc(address).collection("details");
}

// preferences
export function getPreferencesDoc(address: string): DocumentReference<Preferences> {
  return getDetailsCollection(address).withConverter(preferencesConverter).doc("preferences");
}


// kyc
export function getKycDoc(address: string): DocumentReference<KycRecord> {
  return getDetailsCollection(address).withConverter(kycDocConverter).doc("kyc");
}

export function getKycHistoryCollection(address: string): CollectionReference<KycHistory> {
  return getKycDoc(address)
    .collection("history")
    .withConverter(kycHistoryConverter);
}
