
import * as firebase from '@firebase/testing';
import "firebase/firestore";
import { SetFirestore } from './index';

export const isEmulatorAvailable = process.env.FIRESTORE_EMULATOR != 'false'

export const init = async (projectId: string) => {
  if (!isEmulatorAvailable) {
    return null;
  }

  const admin = firebase.initializeAdminApp({
    projectId,
  });

  var _db = admin.firestore();
  // Note that the Firebase Web SDK must connect to the WebChannel port
  _db.settings({
    host: `localhost:${process.env.FIRESTORE_EMULATOR}`,
    ssl: false
  });
  SetFirestore(_db as any);
  return _db;
}

// Directly link to appropriate Timestamp
const Timestamp = firebase.firestore.Timestamp
export { Timestamp };
