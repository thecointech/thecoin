import { getFirestore, CollectionReference, Timestamp, DocumentReference } from "@thecointech/firestore";
import { IsValidAddress, IsValidReferrerId } from "@thecointech/utilities/Address";
import base32 from 'base32';
import { Signer, utils } from 'ethers';
import { getUserDoc, getUserData, ReferralData } from "./user";
import { NewAccountReferal } from "@thecointech/types";

// Referrers stored as /Referrer/{code}/
// This is the list of all legal referrers.
export type VerifiedReferrer = {
  address: string;    // This address of the referrer
  signature: string;  // TheCoin signature for verification
}

export function getReferrersCollection() : CollectionReference<VerifiedReferrer> {
  return getFirestore().collection("Referrer") as CollectionReference<VerifiedReferrer>;
}

// GetReferrer
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

export function getReferrerCode(signature: string) {
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
export async function createReferrer(signature: string, address: string) {
  const code = getReferrerCode(signature);
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
//
export async function createReferree(referral: NewAccountReferal, created: Timestamp) {
  const { referrerId, newAccount } = referral;

  if (!IsValidReferrerId(referrerId)) throw new Error("Invalid Referrer");
  if (!IsValidAddress(newAccount)) throw new Error("Invalid Address");

  const referrerDoc = getReferrerDoc(referrerId);
  const referrer = await referrerDoc.get();
  if (!referrer.exists) throw new Error("Referrer doesnt exist");

  // Create new referral link
  const newUserKey = getUserDoc(newAccount);
  const user = await newUserKey.get();
  if (user.exists) throw new Error("User already exists");

  const data: ReferralData = {
    referredBy: referrer.get("address"),
    created
  };
  await newUserKey.set(data);
  console.log(
    `Create user: ${newAccount} from ${referrer}`
  );
}

//
// Get 6-digit account code, used for e-Transfers & referrals (but from different signers)
export async function GetAccountCode(address: string, signer: Signer)
{
  // generate this signers secret key
  const rhash = GetHash(address.toLowerCase());
  const rsign = await signer.signMessage(rhash);
  return getReferrerCode(rsign);
}

export function GetHash(
  value: string
) {
  const ethersHash = utils.solidityKeccak256(
    ["string"],
    [value]
  );
  return utils.arrayify(ethersHash);
}
