import { getFirestore, CollectionReference, DocumentReference } from "@thecointech/firestore";
import { IsValidAddress, IsValidShortCode, getShortCode } from "@thecointech/utilities";
import { log } from '@thecointech/logging';
import { DateTime } from "luxon";
import { referrerConverter, VerifiedReferrer } from "./referrals.types";
import { ReferralData } from "./user.types";
import { getUserDoc, getUserData, setUserVerified } from "./user.js";

export type { VerifiedReferrer } from './referrals.types';

export function getReferrersCollection() : CollectionReference<VerifiedReferrer> {
  return getFirestore().collection("Referrer").withConverter(referrerConverter);
}

export function getReferrerDoc(code: string) : DocumentReference<VerifiedReferrer> {
  if (!IsValidShortCode(code)) {
    throw new Error("Invalid Short Code");
  }
  return getReferrersCollection().doc(code.toLowerCase());
}

export async function getReferrerData(code: string) {
  const doc = getReferrerDoc(code);
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
export async function createReferrer(signature: string, address: string) {

  // We simply assume we'll find something unique in here
  // Fix prior to 1 billion users... :-)
  for (let offset = 0; offset < signature.length; offset++) {
    let code = getShortCode(signature, offset);
    const maybe = getReferrerDoc(code);
    let existing = await maybe.get();
    // Does this address already have a code?
    if (existing.data()?.address == address) {
      log.debug({address, code}, "Found existing code for {address} - {code}");
      return code;
    }
    // else, if it's a free slot, pop it in.
    if (!existing.exists) {
      const data: VerifiedReferrer = {
        address,
        signature,
        offset,
      };
      await maybe.set(data);

      // update the users data
      await setUserVerified(address, {referralCode: code });
      log.debug({address, code}, "Set new code for {address} - {code}");
      return code
    }
  }

  // This should basically never happen
  log.error({address}, "Couldn't generate unique code for {address}");
  return null;
}

//
// Create a new account with the given referral code.  Not
// every account requires a referral code, but it should not
// be possible to assign codes to existing accounts
export async function createReferree(code: string, newAccount: string, created: DateTime) {

  if (!IsValidAddress(newAccount)) throw new Error("Invalid Address");

  const referrerDoc = getReferrerDoc(code);
  const referrer = await referrerDoc.get();
  if (!referrer.exists) throw new Error("Referral code doesnt exist");

  // Create new referral link
  const newUserKey = getUserDoc(newAccount);
  const user = await newUserKey.get();
  if (user.exists) throw new Error("User already exists");

  const data: ReferralData = {
    referredBy: referrer.get("address"),
    created,
  };
  await newUserKey.set(data);
  log.debug({address: newAccount, referrer: referrer.id}, "Create user: {address} from {referrer}");
}
