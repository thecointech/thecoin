import { Firestore  } from '@google-cloud/firestore';
import { setFirestore } from './store';
import { log } from '@thecointech/logging';

export * from './store';
export { FieldValue, Timestamp } from '@google-cloud/firestore';

export async function init() {
  log.debug('Connecting server-side db running locally');
  if (!(process.env.GAE_ENV || process.env.GOOGLE_APPLICATION_CREDENTIALS))
    throw new Error('Cannot connect to Firestore: no service account found');

  const db = new Firestore();
  setFirestore(db);
  return true;
}
