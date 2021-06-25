import firebase from 'firebase/app';
import 'firebase/firestore';
import { setFirestore } from './firestore';
import { Timestamp } from './timestamp';
export { Timestamp };

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