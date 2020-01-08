//import {IsDebug} from '@the-coin/utilities/IsDebug'

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { SetFirestore } from "@the-coin/utilities/Firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdhUB3KSMgVZHbcf3LyumPDTvJnOpwur0",
  authDomain: "broker-cad.firebaseapp.com",
  databaseURL: "https://broker-cad.firebaseio.com",
  projectId: "broker-cad",
  storageBucket: "broker-cad.appspot.com",
  messagingSenderId: "1006073898040",
  appId: "1:1006073898040:web:fcb0773b0f89f87eed72cd",
  measurementId: "G-TCH828CNKT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const _auth = firebase.auth();



let _credential :firebase.auth.UserCredential|null = null;
export const signIn = async () =>
{
  if (!_credential)
  {
    _credential = await _auth.signInWithEmailAndPassword("stephen@thecoin.io", "$broPdM4WI4N!N^oL4a6!Kf8rcKq3Xof3#j");
    const _db = firebase.firestore();
    SetFirestore(_db as any);
  }
}
export const now = () => firebase.firestore.Timestamp.now();

export const fromMillis = (millis: number) => firebase.firestore.Timestamp.fromMillis(millis);
// if (IsDebug)