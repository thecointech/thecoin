import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { getFirestore, CollectionReference, DocumentReference } from '@thecointech/firestore';
import { KycCurrent, kycDocConverter, KycHistory, kycHistoryConverter } from "./kyc.types";
import { Preferences, preferencesConverter } from "./preferences.types";
import { AllUserData, userDataConverter } from "./basic.types";

// Layout:
//   /User/{addr}                          - basic user data
//   /User/{addr}/details/preferences      - user preferences (encrypted to user)
//   /User/{addr}/details/kyc              - current KYC record (encrypted to BrokerCAD)
//   /User/{addr}/details/kyc/history/{ts} - immutable KYC records (encrypted to BrokerCAD)

export const UserDoc = "User" as const;
export const DetailsCollection = "details" as const;
export const PreferencesDoc = "preferences" as const;
export const KycDoc = "kyc" as const;
export const KycHistoryCollection = "kycHistory" as const; // named kycHistory to avoid overlaps with other 'history' collections

//
// Collection of all users
export function getUserCollection() : CollectionReference<AllUserData> {
  return getFirestore().collection(UserDoc).withConverter(userDataConverter);
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
  return getUserDoc(address).collection(DetailsCollection);
}

// preferences
export function getPreferencesDoc(address: string): DocumentReference<Preferences> {
  return getDetailsCollection(address).withConverter(preferencesConverter).doc(PreferencesDoc);
}


// kyc
export function getKycDoc(address: string): DocumentReference<KycCurrent> {
  return getDetailsCollection(address).withConverter(kycDocConverter).doc(KycDoc);
}

export function getKycHistoryCollection(address: string): CollectionReference<KycHistory> {
  return getKycDoc(address)
    .collection(KycHistoryCollection)
    .withConverter(kycHistoryConverter);
}
