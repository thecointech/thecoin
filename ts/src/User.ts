import { IsValidAddress, NormalizeAddress } from ".";
import { GetFirestore } from './Firestore';
import { Timestamp } from "@google-cloud/firestore";
import { ReferralData } from "./Referrals";

type UserVerifiedInfo = {
	verified: string,
	verifiedTimestamp: Timestamp
}

// A union of all possible data on a user.
type AllUserData = Partial<UserVerifiedInfo> & Partial<ReferralData>

//
// Get user document
//
async function GetUserDoc(address: string) {
  if (!IsValidAddress(address)) {
    console.error(`${address} is not a valid address`);
    throw new Error("Invalid address");
  }
  return (await GetFirestore()).collection("User").doc(NormalizeAddress(address));
}

// Get data associated with user.
async function GetUserData(address: string) {
	const userDoc = await GetUserDoc(address)
	const userData = await userDoc.get();
	return userData.exists ? 
		userData.data() as AllUserData :
		null;
}

//
// Declare that the user address passed in here 
// is a valid, unique person on authority of signature owner
//
async function SetUserVerified(signature: string, address: string) {
	const userDoc = await GetUserDoc(address)
	const data: UserVerifiedInfo = {
		verified: signature,
		verifiedTimestamp: Timestamp.now()
	} 
	// We store the verified signature
	await userDoc.set(data, { merge: true });
}

async function GetUserVerified(address: string) {
	const userData = await GetUserData(address);
	return userData && !!userData.verified;
}

export { GetUserDoc, GetUserData, SetUserVerified, GetUserVerified }