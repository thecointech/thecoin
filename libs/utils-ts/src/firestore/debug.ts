

import firebase from 'firebase/app';
import 'firebase/firestore';
//import { Firestore, Timestamp as TimestampServer } from '@google-cloud/firestore';
import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';

import { ServicePorts } from '../ServiceAddresses';

export async function init(projectId: string) : Promise<boolean> {

  firebase.initializeApp({
    projectId,
  });
  const db = firebase.firestore();
  db.useEmulator("localhost", ServicePorts.FIRESTORE_EMULATOR);
  //  deepcode ignore no-any: TODO: Remove this ANY - https://github.com/thecointech/thecoin/issues/109
  SetFirestore(db as any);

  Timestamp.init(firebase.firestore.Timestamp);
  return true;
}

export async function release() {
  //await Promise.all(firebase.apps().map(app => app.delete()));
}
