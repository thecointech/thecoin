// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from 'firebase/app';

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { setFirestore } from './store';
import { log } from '@thecointech/logging';

export * from './store';
export const Timestamp = firebase.firestore.Timestamp;
export const FieldValue = firebase.firestore.FieldValue;

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

export type BrowserInit = {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

export const init = async (config: BrowserInit) =>
{
  log.debug('Connecting client-side db');

  firebase.initializeApp(config);

  const auth = firebase.auth();
  var provider = new firebase.auth.GoogleAuthProvider();
  const cred = await auth.signInWithPopup(provider);
  if (cred) {
    var db = firebase.firestore();
    setFirestore(db);
    return true;
  }
  return false;
}
