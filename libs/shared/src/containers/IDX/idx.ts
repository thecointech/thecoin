import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import { Signer } from 'ethers';
import { Ceramic } from './ceramic';
import { createAuthProvider } from './connect';
import { log } from '@thecointech/logging';
import { authenticateDID } from './did';


type Aliases = {
  details: string
};
export type IdxAlias = keyof Aliases;

async function createIDX(ceramic: CeramicApi) {
  const config = await import(`./config.${process.env.CONFIG_NAME}.json`);
  const aliases: Aliases = {
    details: config.default.definitions.privateDetails
  }
  const idx = new IDX({ ceramic, aliases })
  return idx
}

export const connectIDX = async (signer: Signer) => {
  try {
    log.trace("Initiating connection to IDX...");
    const authProvider = await createAuthProvider(signer);

    // Auth to ceramic
    const ceramic = Ceramic();
    await authenticateDID(authProvider, ceramic);

    // Create IDX
    const idx = await createIDX(ceramic);
    log.trace("Connected to IDX");
    return idx;
  }
  catch (err) {
    const Address = await signer.getAddress();
    log.error(err, {Address}, `Could not connect ceramc for {Address}`);
  }
  return null;
}
