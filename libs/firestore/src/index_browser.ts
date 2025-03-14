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

firebase.initializeApp({
  apiKey: process.env.TCCC_FIRESTORE_API_KEY,
  authDomain: process.env.TCCC_FIRESTORE_AUTH_DOMAIN,
  projectId: process.env.TCCC_FIRESTORE_PROJECT_ID,
});

export const init = async () =>
{
  log.debug('Connecting client-side db');

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
