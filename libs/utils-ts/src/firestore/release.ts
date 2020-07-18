import { Firestore, Timestamp as TimestampRelease } from '@google-cloud/firestore';
import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';

export async function init() {
  const db = new Firestore();
  SetFirestore(db);

  Timestamp.init(TimestampRelease);
}
