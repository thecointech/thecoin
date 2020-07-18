
import * as firebase from '@firebase/testing';
import "firebase/firestore";
import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';

export const isEmulatorAvailable = process.env.FIRESTORE_EMULATOR != 'false'

export async function init(projectId: string) {
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

  // Directly link to appropriate Timestamp
  Timestamp.init(firebase.firestore.Timestamp)
  return _db;
}
