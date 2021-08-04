// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from 'firebase/app';

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { setFirestore } from './store';
// import firebaseConfig from "./password.config.json";
import { log } from '@thecointech/logging';

export * from './store';
export const Timestamp = firebase.firestore.Timestamp;
export const FieldValue = firebase.firestore.FieldValue;

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

firebase.initializeApp({
  apiKey: process.env.TCCC_FIRESTORE_API_KEY,
  authDomain: process.env.TCCC_FIRESTORE_AUTH_DOMAIN,
  projectId: process.env.TCCC_FIRESTORE_PROJECT_ID,
});


export type BrowserInit = {
  username: string,
  password: string
}

export const init = async () =>
{
  log.debug('Connecting client-side db');

  const auth = firebase.auth();
  //const cred = await auth.signInWithEmailAndPassword(username, password);
  var provider = new firebase.auth.GoogleAuthProvider();
  const cred = await auth.signInWithPopup(provider);
  if (cred) {
    var db = firebase.firestore();
    setFirestore(db);
  }
  return false;

  // const _auth = firebase.auth();
  // const cred = await _auth.signInWithEmailAndPassword(username, password);
  // if (cred != null)
  // {
  //   const db = firebase.firestore();
  //   setFirestore(db);
  //   return true;
  // }
  // return false;
}
