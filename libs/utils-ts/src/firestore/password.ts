//import {IsDebug} from '@the-coin/utilities/IsDebug'

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';
import firebaseConfig from "./password.config.json";
// Your web app's Firebase configuration

export const init = async (name: string, password: string) =>
{
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const _auth = firebase.auth();
  const cred = await _auth.signInWithEmailAndPassword(name, password);
  if (cred != null)
  {
    const _db = firebase.firestore();
    SetFirestore(_db as any);
    Timestamp.init(firebase.firestore.Timestamp);
    return true;
  }
  return false;
}
