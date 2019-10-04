import { GetFirestore } from "./Firestore";
import { IsValidAddress, IsValidReferrerId } from "./Address";
import { BrokerCAD } from "@the-coin/types";
import base32 from "base32";
import { GetUserDoc, GetUserData } from "./User";
import { Timestamp } from "./FirebaseFirestore";

export function GetReferrersCollection() {
  return GetFirestore().collection("Referrers");
}

// Document stored as /Referrer/{id}/
// Contains the address of the referrer, and is
// signed by TheCoin
export interface VerifiedReferrer {
  address: string;
  signature: string;
}

// Subsection of user-data associated with referrals
export interface ReferralData {
  created: Timestamp;
  referrer: string;
}

// GetReferrer
export function GetReferrerDoc(referrerId: string) {
  if (!IsValidReferrerId(referrerId)) {
    console.error(`${referrerId} is not a valid address`);
    throw new Error("Invalid Referrer");
  }
  return GetReferrersCollection().doc(referrerId.toLowerCase());
}

export async function GetReferrerData(referrerId: string) {
  const doc = GetReferrerDoc(referrerId);
  const referrer = await doc.get();
  return referrer.exists ? (referrer.data() as VerifiedReferrer) : null;
}

export async function GetUsersReferrer(address: string) {
  const user = await GetUserData(address);
  if (user && user.referrer && user.created) {
    return user as ReferralData;
  }
  return null;
}

export function GetReferrerCode(signature: string) {
  const normSig = signature[1] == "x" ? signature.slice(2) : signature;
  const buffer = Buffer.from(normSig, "hex");
  const s2: string = base32.encode(buffer);
  return s2.slice(-6).toLowerCase();
}

//
//  Add a referral code for an account
//  TODO: Only verified accounts can have referral codes?
//  TODO: Re-consider naming (eg consistent use of word 'code')
//  TODO: Move the signature creation inside this function
//
export async function CreateReferrer(signature: string, address: string) {
  const code = GetReferrerCode(signature);
  const referrerDoc = GetReferrerDoc(code);

  const data: VerifiedReferrer = {
    address,
    signature
  };
  await referrerDoc.set(data);
  return code;
}

// 
// Create a new account with the given referral code.  Not
// every account requires a referral code, but it should not
// be possible to assign codes to existing accounts
//
export async function CreateReferree(referral: BrokerCAD.NewAccountReferal, created: Timestamp) {
  const { referrerId, newAccount } = referral;

  if (!IsValidReferrerId(referrerId)) throw new Error("Invalid Referrer");
  if (!IsValidAddress(newAccount)) throw new Error("Invalid Address");

  const referrerDoc = GetReferrerDoc(referrerId);
  const referrer = await referrerDoc.get();
  if (!referrer.exists) throw new Error("Referrer doesnt exist");

  // Create new referral link
  const newUserKey = GetUserDoc(newAccount);
  const user = await newUserKey.get();
  if (user.exists) throw new Error("User already exists");

  const data: ReferralData = {
    referrer: referrer.get("address"),
    created
  };
  await newUserKey.set(data);
  console.log(
    `Create user: ${newAccount} from ${referrer}`
  );
}
