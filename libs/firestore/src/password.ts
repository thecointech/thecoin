// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import firebase from 'firebase/app';

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { setFirestore } from './firestore';
import { Timestamp } from './timestamp';
import firebaseConfig from "./password.config.json";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const init = async (name: string, password: string) =>
{
  const _auth = firebase.auth();
  const cred = await _auth.signInWithEmailAndPassword(name, password);
  if (cred != null)
  {
    const db = firebase.firestore();
    setFirestore(db);
    Timestamp.init(firebase.firestore.Timestamp);
    return true;
  }
  return false;
}
