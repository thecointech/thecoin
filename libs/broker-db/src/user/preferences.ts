import { type DocumentReference, getFirestore, type FirestoreAdmin } from '@thecointech/firestore';
import type { DocumentReference as AdminDocumentReference } from '@google-cloud/firestore';
import type { EncryptedBlob } from '@thecointech/account-details/types';
import { DateTime } from 'luxon';
import { getPreferencesDoc } from './layout';

const MAX_WRITES_PER_DAY = 50;

// Narrow to the admin SDK for transactions (don't call in electron client code!)
const toAdminRef = <T>(ref: DocumentReference<T>) =>
  ref as unknown as AdminDocumentReference<T>;

export async function getUserPreferences(address: string) {
  const snap = await getPreferencesDoc(address).get();
  return snap.data();
}

// Update the preferences blob.  Read & increment of the daily write
// counter happen in a transaction so concurrent writes can't bypass it.
export async function setUserPreferences(address: string, blob: EncryptedBlob) {
  const db = getFirestore() as FirestoreAdmin;
  const ref = toAdminRef(getPreferencesDoc(address));
  await db.runTransaction(async transaction => {
    const existing = (await transaction.get(ref)).data();
    const now = DateTime.now();
    const dayWrites = existing?.updated.hasSame(now, "day")
      ? existing.dayWrites
      : 0;
    if (dayWrites >= MAX_WRITES_PER_DAY) {
      throw new RateLimitError("Too many preference updates in a day");
    }
    transaction.set(ref, {
      blob,
      updated: now,
      dayWrites: dayWrites + 1,
    });
  });
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}
