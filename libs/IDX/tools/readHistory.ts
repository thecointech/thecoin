import { getSigner } from "@thecointech/signers";
import { getOneOffEncryptDid } from '../src/oneOffDid';
import { getComposeDB, getEncrypted, getHistory } from '../src/';

global.window = {
  location: {
    hostname: "localhost",
  } as any
} as any


const user = await getSigner("Client1");
const address = await user.getAddress();
const client = await getComposeDB(user);

const bla = await getEncrypted(client);
const history = await getHistory(address, client, 3);

const validator = await getSigner("CeramicValidator");
const did = await getOneOffEncryptDid(validator);

for (const h of history ?? []) {
  try {
    const decrypted = await did.decryptDagJWE(h);
    console.log(decrypted);
  }
  catch (e: any) {
    // console.log(e);
  }
}

