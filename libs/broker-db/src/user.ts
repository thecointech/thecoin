import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { getFirestore, CollectionReference, DocumentReference } from '@thecointech/firestore';
import { AllUserData, userDataConverter, UserVerifiedInfo } from "./user.types";
import { DateTime } from "luxon";

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
// Declare that the user address passed in here
// is a valid, unique person on authority of signature owner
export async function setUserVerified(signature: string, address: string, date: DateTime) {
	const userDoc = getUserDoc(address)
	const data: UserVerifiedInfo = {
		verified: signature,
		verifiedDate: date
	}
	// We store the verified signature
	await userDoc.set(data, { merge: true });
}

export async function getUserVerified(address: string) {
	const userData = await getUserData(address);
	return userData?.verified;
}
