import { getComposeDB } from '../src/composedb'
import { Wallet } from "@ethersproject/wallet";

export async function getClient() {
  global.window = {
    location: {
      hostname: "localhost",
    } as any
  } as any

  const signer = Wallet
    .fromMnemonic("test test test test test test test test test test test junk");

  const client = await getComposeDB(signer);
  return { signer, client };
}
