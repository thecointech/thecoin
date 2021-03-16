import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import { Signer } from 'ethers';
import { Ceramic } from './ceramic';
import config from './config.json';
import { getProvider } from './connect';
import { log } from '@the-coin/logging';

const aliases = {
  details: config.definitions.privateDetails
}
export type IdxAlias = keyof typeof aliases;

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic, aliases })
  return idx
}

export const connectIDX = async (signer: Signer) => {
  try {
    const ceramic = Ceramic();
    const provider = await getProvider(signer);
    await ceramic.setDIDProvider(provider);
    const idx = createIDX(ceramic);
    return idx;
  }
  catch (err) {
    const Address = await signer.getAddress();
    log.error(err, {Address}, `Could not connect ceramc for {Address}`);
  }
  return null;
}

export const getDID = () => Ceramic().did!;
