import { Firestore, Timestamp as TimestampRelease } from '@google-cloud/firestore';
import { setFirestore } from './firestore';
import { Timestamp } from './timestamp';

export async function init() {
  const db = new Firestore();
  setFirestore(db);

  Timestamp.init(TimestampRelease);
  return true;
}
