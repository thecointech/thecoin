import { IsValidAddress, NormalizeAddress } from ".";
import { GetFirestore } from './Firestore';
import { ReferralData } from "./Referrals";
import { Timestamp, DocumentReference } from "./FirebaseFirestore";

type UserVerifiedInfo = {
	verified: string,
	verifiedTimestamp: Timestamp|Date
}

// A union of all possible data on a user.
type AllUserData = Partial<UserVerifiedInfo> & Partial<ReferralData>

export type UserAction = "Buy"|"Sell"|"Bill";

//
// Get user document
//
function GetUserDoc(address: string): DocumentReference {
  if (!IsValidAddress(address)) {
    console.error(`${address} is not a valid address`);
    throw new Error("Invalid address");
  }
  return GetFirestore().collection("User").doc(NormalizeAddress(address));
}

// Get data associated with user.
async function GetUserData(address: string) {
	const userDoc = GetUserDoc(address)
	const userData = await userDoc.get();
	return userData.exists ? 
		userData.data() as AllUserData :
		null;
}

//
// Declare that the user address passed in here 
// is a valid, unique person on authority of signature owner
//
async function SetUserVerified(signature: string, address: string, timestamp: Timestamp) {
	const userDoc = GetUserDoc(address)
	const data: UserVerifiedInfo = {
		verified: signature,
		verifiedTimestamp: timestamp
	} 
	// We store the verified signature
	await userDoc.set(data, { merge: true });
}

async function GetUserVerified(address: string) {
	const userData = await GetUserData(address);
	return userData && !!userData.verified;
}

//
// Helper functions for accessing stuff
//
function GetActionDoc(user: string, action: UserAction, hash: string): DocumentReference { 
	const userDoc = GetUserDoc(user);
	return userDoc.collection(action).doc(hash);
}

function GetActionRef(action: UserAction, hash: string): DocumentReference { 
  return GetFirestore().collection(action).doc(hash);
}

export { GetUserDoc, GetUserData, SetUserVerified, GetUserVerified, GetActionDoc, GetActionRef }