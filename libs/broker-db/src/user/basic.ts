import { AllUserData } from "./basic.types";
import { getUserCollection, getUserDoc } from "./layout";

//
// get data associated with user, or undefined
export async function getUserBasicData(address: string) : Promise<AllUserData|undefined> {
  const userDoc = getUserDoc(address)
  const userData = await userDoc.get();
  return userData.data();
}

//
// Merge basic user data
export async function setUserBasicData(address: string, data: AllUserData) {
  const userDoc = getUserDoc(address)
  await userDoc.set(data, { merge: true });
}

export async function getUserVerified(address: string) {
  const userData = await getUserBasicData(address);
  return userData?.status == "approved";
}

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
// Get all verified users awaiting a referral code.
// We only support this because our online service cannot
// sign our users referral codes (at least, not without
// BrokerCAD unlocked, which I'm hestitant to make hot)
export async function getUsersPendingReferral() {
  const r = await getUserCollection()
    .where("referralStatus", "==", "pending")
    .get();
  // TODO: Remove unnecessary spread once TS is upgraded
  return [...r.docs].map(doc => ({
    ...doc.data(),
    address: doc.id,
  }));
}
