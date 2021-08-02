// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from 'firebase/app';

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { setFirestore } from './store';
import firebaseConfig from "./password.config.json";
import { log } from '@thecointech/logging';

export * from './store';
export const Timestamp = firebase.firestore.Timestamp;
export const FieldValue = firebase.firestore.FieldValue;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export type BrowserInit = {
  username: string,
  password: string
}

export const init = async ({username, password}: BrowserInit) =>
{
  log.debug('Connecting client-side db');

  const _auth = firebase.auth();
  const cred = await _auth.signInWithEmailAndPassword(username, password);
  if (cred != null)
  {
    const db = firebase.firestore();
    setFirestore(db);
    return true;
  }
  return false;
}
