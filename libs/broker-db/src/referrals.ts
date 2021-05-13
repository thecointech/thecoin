import { getFirestore, CollectionReference, DocumentReference } from "@thecointech/firestore";
import { IsValidAddress, IsValidReferrerId, getShortCode } from "@thecointech/utilities";
import { DateTime } from "luxon";
import { referrerConverter, VerifiedReferrer } from "referrals.types";
import { ReferralData } from "user.types";
import { getUserDoc, getUserData } from "./user";

export function getReferrersCollection() : CollectionReference<VerifiedReferrer> {
  return getFirestore().collection("Referrer").withConverter(referrerConverter);
}

export function getReferrerDoc(referrerId: string) : DocumentReference<VerifiedReferrer> {
  if (!IsValidReferrerId(referrerId)) {
    console.error(`${referrerId} is not a valid address`);
    throw new Error("Invalid Referrer");
  }
  return getReferrersCollection().doc(referrerId.toLowerCase());
}

export async function getReferrerData(referrerId: string) {
  const doc = getReferrerDoc(referrerId);
  const referrer = await doc.get();
  return referrer.data();
}

export async function getUsersReferrer(address: string) {
  const user = await getUserData(address);
  if (user?.referredBy && user?.created) {
    return user as ReferralData;
  }
  return null;
}

//
//  Add a referral code for an account
//  TODO: Only verified accounts can have referral codes?
//  TODO: Re-consider naming (eg consistent use of word 'code')
//  TODO: Move the signature creation inside this function
//
export async function createReferrer(signature: string, address: string) {
  const code = getShortCode(signature);
  const referrerDoc = getReferrerDoc(code);

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
export async function createReferree(referralCode: string, newAccount: string, created: DateTime) {

  if (!IsValidReferrerId(referralCode)) throw new Error("Invalid Referrer");
  if (!IsValidAddress(newAccount)) throw new Error("Invalid Address");

  const referrerDoc = getReferrerDoc(referralCode);
  const referrer = await referrerDoc.get();
  if (!referrer.exists) throw new Error("Referrer doesnt exist");

  // Create new referral link
  const newUserKey = getUserDoc(newAccount);
  const user = await newUserKey.get();
  if (user.exists) throw new Error("User already exists");

  const data: ReferralData = {
    referredBy: referrer.get("address"),
    created,
  };
  await newUserKey.set(data);
  console.log(
    `Create user: ${newAccount} from ${referrer}`
  );
}
