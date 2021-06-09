import { Firestore, Timestamp as TimestampServer } from '@google-cloud/firestore';
import { setFirestore } from './firestore';
import { Timestamp } from './timestamp';
// Create a new client

export async function init() {
  const db = new Firestore();
  setFirestore(db);

  Timestamp.init(TimestampServer);
  return true;
}
