import type { KycRecord } from '@thecointech/account-details/types';
import { getFirestore } from '@thecointech/firestore';
import { DateTime } from 'luxon';
import { getKycDoc, getKycHistoryCollection, DetailsCollection, KycDoc, KycHistoryCollection, UserDoc, getUserDoc } from './layout';
import { KycCurrent } from './kyc.types';
import { AllUserData } from './basic.types';

// Append a new immutable KYC record to history, and set it as current.
// History records are never modified - each completed KYC run gets a new entry.
export async function addKycRecord(address: string, uniqueIdSig: string|null, record: KycRecord) {
  const created = DateTime.now();
  await getKycHistoryCollection(address)
    .doc(created.toMillis().toString())
    .set({ record, created, uniqueIdSig });
}

export async function finalizeKyc(
  address: string,
  data: Partial<AllUserData>,
  acceptedRecord: KycCurrent|undefined,
) {
  const batch = getFirestore().batch();

  batch.set(getUserDoc(address), data, { merge: true });
  if (acceptedRecord) {
    batch.set(getKycDoc(address), acceptedRecord);
  }

  await batch.commit();
}

// export async function setCurrentKycRecord(address: string, record: KycCurrent) {
//   await getKycDoc(address).set(record);
// }

// Fetch the current (most recent) KYC record
export async function getCurrentKycRecord(address: string) {
  const snap = await getKycDoc(address).get();
  return snap.data();
}

// Get users with matching UniqueIdSig
export async function getUsersWithUniqueIdSig(uniqueIdSig: string): Promise<string[]> {
  const r = await getFirestore().collectionGroup(KycHistoryCollection)
    .where("uniqueIdSig", "==", uniqueIdSig)
    .get();

  // TODO: Remove unnecessary spread once TS is upgraded
  const addresses = new Set([...r.docs].flatMap(doc => {
    const parts = doc.ref.path.split("/");
    return (
      parts.length === 6 &&
      parts[0] === UserDoc &&
      parts[2] === DetailsCollection &&
      parts[3] === KycDoc &&
      parts[4] === KycHistoryCollection
        ? [parts[1]]
        : []
    );
  }));
  return [...addresses];
}
