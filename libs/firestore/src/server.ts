import { Firestore, Timestamp as TimestampServer } from '@google-cloud/firestore';
import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';
// Create a new client

export async function init() {
  const db = new Firestore();
  SetFirestore(db);

  Timestamp.init(TimestampServer);
  return true;
}
