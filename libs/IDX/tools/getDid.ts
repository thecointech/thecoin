import { getAdminDID } from '../internal/admin';

// import { LedgerSigner } from "@thecointech/hardware-wallet";
import { getSigner } from "@thecointech/signers";
import { getOneOffEncryptDid } from '../src/oneOffDid';

// const signer = new LedgerSigner();
const signer = await getSigner("CeramicValidator");
const address = await signer.getAddress();
console.log(address);
const did = await getOneOffEncryptDid(signer);
// const did = await getAdminDID();

console.log(did.id);
