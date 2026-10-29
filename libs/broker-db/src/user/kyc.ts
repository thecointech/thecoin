import type { KycRecord } from '@thecointech/account-details/types';
import { DateTime } from 'luxon';
import { getKycDoc, getKycHistoryCollection } from './layout';

// Append a new immutable KYC record to history, and set it as current.
// History records are never modified - each completed KYC run gets a new entry.
export async function addKycRecord(address: string, record: KycRecord) {
  const created = DateTime.now();
  await getKycHistoryCollection(address)
    .doc(created.toMillis().toString())
    .set({ record, created });
  await getKycDoc(address).set(record);
}

// Fetch the current (most recent) KYC record
export async function getCurrentKycRecord(address: string) {
  const snap = await getKycDoc(address).get();
  return snap.data();
}
