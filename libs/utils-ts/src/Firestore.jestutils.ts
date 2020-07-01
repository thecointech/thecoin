import * as firebase from '@firebase/testing';
import "firebase/firestore";
import { SetFirestore } from './Firestore';


///////////////////////////////////////////////////////////////
// Firestore helper functions

export const isEmulatorAvailable = process.env.FIRESTORE_EMULATOR != 'false'

export const initializeFirestore = async (projectId: string) => {
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

const old_describe = describe;
const db_describe = async (name: number | string | Function, fn: () => void | Promise<any>) => {

  if (!isEmulatorAvailable)
  {
    console.warn("Cannot connect to firestore, abandoning unit tests");
    return old_describe.skip(name, fn);
  }
  return old_describe(name, fn)
}

export { db_describe as describe };
