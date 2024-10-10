import { getSigner } from "@thecointech/signers";

const signer = await getSigner("testDemoAccount");

const nonce = await signer.getNonce();
console.log("Nonce: " + nonce)
console.log("Address: " + await signer.getAddress())

