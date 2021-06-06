import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import { Signer } from 'ethers';
import { Ceramic } from './ceramic';
import { get3idConnect } from './connect';
import { log } from '@thecointech/logging';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { DID } from 'dids'

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
    const threeIdConnect = await get3idConnect(signer);
    const ceramic = Ceramic()

    // Authenticate did
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: ThreeIdResolver.getResolver(ceramic)
    })
    await did.authenticate()

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

export const getDID = () => Ceramic().did!;
