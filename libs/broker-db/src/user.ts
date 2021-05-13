import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { getFirestore, Timestamp, CollectionReference, DocumentReference } from '@thecointech/firestore';

export type UserVerifiedInfo = {
	verified: string,
	verifiedTimestamp: Timestamp|Date
}
export type ReferralData = {
  created: Timestamp|Date;
  referredBy: string;
}
// A union of all possible data on a user.
type AllUserData = Partial<UserVerifiedInfo&ReferralData>

//
// Collection of all users
export function getUserCollection() : CollectionReference<AllUserData> {
  return getFirestore().collection("User");
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
// Declare that the user address passed in here
// is a valid, unique person on authority of signature owner
export async function setUserVerified(signature: string, address: string, timestamp: Timestamp) {
	const userDoc = getUserDoc(address)
	const data: UserVerifiedInfo = {
		verified: signature,
		verifiedTimestamp: timestamp
	}
	// We store the verified signature
	await userDoc.set(data, { merge: true });
}

export async function getUserVerified(address: string) {
	const userData = await getUserData(address);
	return userData?.verified;
}
