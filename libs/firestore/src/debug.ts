import firebase from 'firebase/app';
import 'firebase/firestore';
import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';

export async function init(projectId: string) : Promise<boolean> {

  firebase.initializeApp({
    projectId,
  });
  const db = firebase.firestore();
  const port = Number(process.env.FIRESTORE_EMULATOR_PORT ?? 8377);
  db.useEmulator("localhost", port);
  //  deepcode ignore no-any: TODO: Remove this ANY - https://github.com/thecointech/thecoin/issues/109
  SetFirestore(db as any);

  Timestamp.init(firebase.firestore.Timestamp);
  return true;
}
