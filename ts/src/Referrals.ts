import { Timestamp } from "@google-cloud/firestore";
import { firestore, GetUserDoc } from "./Firestore";
import { IsValidAddress, IsValidReferrerId } from "./Address";
import { BrokerCAD } from "@the-coin/types";
import base32 from "base32";

function GetReferrersCollection() {
  return firestore.collection("Referrers");
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
  const referrer = await GetReferrerDoc(referrerId).get();
  return referrer.exists ? (referrer.data() as VerifiedReferrer) : null;
}

export async function GetUsersReferrer(address: string) {
  const user = await GetUserDoc(address).get();
  if (user.exists && user.get("referrer")) {
    return user.data() as ReferralData;
  }
  return null;
}

function GetReferrerCode(signature: string) {
  const normSig = signature[1] == "x" ? signature.slice(2) : signature;
  const buffer = Buffer.from(normSig, "hex");
  const s2: string = base32.encode(buffer);
  return s2.slice(-6).toLowerCase();
}

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

export async function CreateReferree(referral: BrokerCAD.NewAccountReferal) {
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
    created: Timestamp.now()
  };
  const result = await newUserKey.set(data);
  console.log(
    `Create user: ${newAccount} from ${referrer} ${result.writeTime}`
  );
}
