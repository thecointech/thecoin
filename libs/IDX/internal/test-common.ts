import { getComposeDB } from '../src/composedb'
import { Wallet } from "ethers";

export async function getClient() {
  global.window = {
    location: {
      hostname: "localhost",
    } as any
  } as any

  const signer = Wallet.fromPhrase("test test test test test test test test test test test junk");

  const client = await getComposeDB(signer);
  return { signer, client };
}
