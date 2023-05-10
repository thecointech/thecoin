import { getAdminDID } from '../internal/admin';

import { LedgerSigner } from "@thecointech/hardware-wallet";
import { getOneOffEncryptDid } from '../src/oneOffDid';

const signer = new LedgerSigner();
const address = await signer.getAddress();
console.log(address);
const did = await getOneOffEncryptDid(signer);
// const did = await getAdminDID();

console.log(did.id);
