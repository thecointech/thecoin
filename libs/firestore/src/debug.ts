import firebase from 'firebase/app';
import 'firebase/firestore';
import { setFirestore } from './firestore';
import { Timestamp } from './timestamp';
import { isEmulatorAvailable } from './types';

export async function init(projectId?: string) : Promise<boolean> {

  firebase.initializeApp({
    projectId: projectId ?? "broker-cad",
  });
  const db = firebase.firestore();
  const port = Number(process.env.FIRESTORE_EMULATOR_PORT ?? 8377);
  db.useEmulator("localhost", port);
  setFirestore(db);
  Timestamp.init(firebase.firestore.Timestamp);
  return true;
}

///////////////////////////////////////////////////////////////
// For Jest fn's that connect to the emulator:
// Do not attempt to connect if we do not have an
// active connection.
export function filterByEmulator() {
  if (!isEmulatorAvailable()) {
    console.warn("Cannot connect to firestore, abandoning unit tests");
    return false;
  }
  return true;
}
