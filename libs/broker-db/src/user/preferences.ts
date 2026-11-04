import { type DocumentReference, getFirestore, type FirestoreAdmin } from '@thecointech/firestore';
import type { DocumentReference as AdminDocumentReference } from '@google-cloud/firestore';
import type { EncryptedBlob } from '@thecointech/account-details/types';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { getPreferencesDoc } from './layout';

const MAX_WRITES_PER_DAY = 50;

// Global circuit breaker: preference writes are free-form for now
// (any account may store a blob), so bound the total blast radius.
// At 10KB max per blob the hard cap limits worst-case writes to ~500MB/day.
const GLOBAL_WRITES_WARN = 1_000;
const GLOBAL_WRITES_MAX = 50_000;

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
  const globalRef = toAdminRef(
    getFirestore().doc("Meta/preferencesWrites") as unknown as DocumentReference<GlobalWrites>
  );
  await db.runTransaction(async transaction => {
    const now = DateTime.now();
    const today = now.toISODate();

    // Global daily cap, checked first so abuse can't drown out legit users.
    const globalDoc = (await transaction.get(globalRef)).data();
    const globalWrites = globalDoc?.day === today
      ? globalDoc.count
      : 0;
    if (globalWrites >= GLOBAL_WRITES_MAX) {
      throw new RateLimitError("Global preference write limit reached");
    }
    // Errors start logging at GLOBAL_WRITES_WARN, then repeat every 1K writes.
    const newCount = globalWrites + 1;
    if (newCount >= GLOBAL_WRITES_WARN && newCount % 1_000 === 0) {
      log.error({ count: newCount },
        "Preference writes hit {count} today - possible abuse, circuit breaker at " + GLOBAL_WRITES_MAX);
    }

    const existing = (await transaction.get(ref)).data();
    const dayWrites = existing?.updated?.hasSame(now, "day")
      ? existing.dayWrites
      : 0;
    if (dayWrites >= MAX_WRITES_PER_DAY) {
      throw new RateLimitError("Too many preference updates in a day");
    }
    transaction.set(globalRef, {
      day: today,
      count: newCount,
    });
    transaction.set(ref, {
      blob,
      updated: now,
      dayWrites: dayWrites + 1,
    });
  });
}

type GlobalWrites = {
  day: string; // ISO date (yyyy-MM-dd, service timezone)
  count: number;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}
