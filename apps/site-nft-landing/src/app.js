import './reset.css'
import './styles.less'
import "./index.html";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCm1etOBTU8XvdkuaPqaSLbV-hkJKIJ_bU",
  authDomain: "thegreennft.io",
  projectId: "tc-nft",
  storageBucket: "tc-nft.appspot.com",
  messagingSenderId: "832452880693",
  appId: "1:832452880693:web:d9a34ed6804f630463847c",
  measurementId: "G-QPMHY6F366"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const analytics = getAnalytics();
