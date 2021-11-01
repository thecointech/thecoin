import './reset.css'
import './styles.less'
import "./index.html";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

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

// Track when entering iframe.  Cheap 'n dirty hack to get conversion data on free tier of prefinery.
// main document must be focused in order for window blur to fire when the iframe is interacted with.
// There's still an issue that if user interacts outside of the page and then click iframe first without clicking page, the following logic won't run. But since the OP is only concerned about first click this shouldn't be a problem.
var monitor = setInterval(function () {
  var elem = document.activeElement;
  if (elem && elem.tagName?.toLowerCase() == 'iframe') {
    clearInterval(monitor);
    // Is top or bottom iframe?
    const iframeIdx = document.activeElement.parentElement.parentElement.className === "jacketForm"
      ? 1
      : 2;
    statsig.logEvent(`iframeClicked${iframeIdx}`);
    logEvent(analytics, `iframeClicked${iframeIdx}`);
  }
}, 100);

// // Simple A/B test on different copy variants.
// document.addEventListener("DOMContentLoaded", async () => {
//   // Ensure window has finished loading.
//   await window.testsInit;
//   console.log("Beginning tests");
//   if (statsig.checkGate('textvariants') || true) {
//     const span = document.getElementById("headerL1");
//     span.textContent = "A fair-trade jacket"
//   }
// });
