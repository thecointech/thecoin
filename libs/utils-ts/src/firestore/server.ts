import { Firestore } from '@google-cloud/firestore';
import { SetFirestore } from './firestore';
export { Timestamp } from '@google-cloud/firestore';
// Create a new client

export async function init() {
  const db = new Firestore();
  SetFirestore(db);
}
