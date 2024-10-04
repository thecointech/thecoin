import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { getFirestore, CollectionReference, DocumentReference } from '@thecointech/firestore';
import { AllUserData, userDataConverter, UserVerifiedInfo } from "./user.types";
import { getActionDoc } from './transaction';
import { DateTime } from 'luxon';

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

//
// get data associated with user, or undefined
export async function getUserData(address: string) : Promise<AllUserData|undefined> {
	const userDoc = getUserDoc(address)
	const userData = await userDoc.get();
	return userData.data();
}

//
// Get users with matching UniqueIdSig
export async function getUsersWithUniqueIdSig(uniqueIdSig: string) {
  const r = await getUserCollection()
    .where("uniqueIdSig", "==", uniqueIdSig)
    .get();

  // TODO: Remove unnecessary spread once TS is upgraded
  return [...r.docs].map(doc => ({
    ...doc.data(),
    address: doc.id,
  }));
}

//
// This awkwardly named function gets all users data
// that includes verified data and without referral codes.
// We only support this because our online service cannot
// sign our users referral codes (at least, not without
// BrokerCAD unlocked, which I'm hestitant to make hot)
export async function getVerifiedUsersNoReferralCode() {
  const r = await getUserCollection()
    .where("referralCode", "==", null)
    .get();
  // TODO: Remove unnecessary spread once TS is upgraded
  return [...r.docs].map(doc => ({
    ...doc.data(),
    address: doc.id,
  }));
}

//
// Declare that the user address passed in here
// is a valid, unique person on authority of signature owner
export async function setUserVerified(address: string, data: Partial<UserVerifiedInfo>) {
	const userDoc = getUserDoc(address)
	// We store the verified signature
	await userDoc.set(data, { merge: true });
}

export async function getUserVerified(address: string) {
	const userData = await getUserData(address);
	return userData?.status == "approved";
}

export async function setHeartbeat(address: string, errors?: string[]) {
  // always push a new entry
  const doc = getActionDoc(address, "Heartbeat");
  if (errors?.length) {
    // Annoyingly, firestore won't let us pass undefined entries
    await doc.set({
      date: DateTime.now(),
      errors,
    })
  }
  else {
    await doc.set({
      date: DateTime.now(),
    })
  }
}
