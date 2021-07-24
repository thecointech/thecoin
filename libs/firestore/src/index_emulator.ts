import firebase from 'firebase/app';
import 'firebase/firestore';
import { setFirestore } from './store';
import { isEmulatorAvailable } from '@thecointech/jestutils/emulator'
import { log } from '@thecointech/logging';

export * from './store';
export const Timestamp = firebase.firestore.Timestamp
export const FieldValue = firebase.firestore.FieldValue;

export type EmulatorInit = {
  project: string;
}
export async function init(projectId?: EmulatorInit) : Promise<boolean> {
  log.debug('Attempting to connect to Firestore emulator');
  if (!isEmulatorAvailable())
    throw new Error('Cannot connect to Emulator: Port is not open');

  firebase.initializeApp({
    projectId: projectId?.project ?? "broker-cad",
  });
  const db = firebase.firestore();
  const port = Number(process.env.FIRESTORE_EMULATOR_PORT ?? 9377);
  db.useEmulator("localhost", port);
  setFirestore(db);
  return true;
}
