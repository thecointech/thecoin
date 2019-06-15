import { Firestore, Settings } from "@google-cloud/firestore";
import { IsValidAddress, NormalizeAddress } from "./Address";

// Verify that in production, we have connection credentials
if (process.env.NODE_ENV == "production") {
  // We should either be running on GAE or have a service account
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GAE_ENV) {
    throw new Error("Firestore Connect: No Service Account enabled");
  }
} else {
  // Assume development environment
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("Firestore Connect: Local Connection not specified");
  }
  if (!!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "Firestore Connect: Credentials supplied in development environment"
    );
  }
}
const settings: Settings = {
  projectId: "broker-cad" // project id is random for each run
};
const firestore = new Firestore(settings);

function GetUserDoc(address: string) {
  if (!IsValidAddress(address)) {
    console.error(`${address} is not a valid address`);
    throw new Error("Invalid address");
  }
  return firestore.collection("User").doc(NormalizeAddress(address));
}

export { firestore, GetUserDoc };
