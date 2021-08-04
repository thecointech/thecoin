import { init } from '@thecointech/firestore';
import sampledb from './sampledb.dev.json';

export async function initFirestore() {

  // Pass sample data, in dev mode it will
  return await init(sampledb);
}
