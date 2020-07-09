import { Firestore } from '@google-cloud/firestore';
import { SetFirestore } from './index';

export async function init() {
  const db = new Firestore();
  SetFirestore(db);
}
