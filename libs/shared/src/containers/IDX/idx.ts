import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import { TheSigner } from '../../SignerIdent';
import { Ceramic } from './ceramic';
import config from './config.json';
import { getProvider } from './connect';

const aliases = {
  details: config.definitions.privateDetails
}
export type IdxAlias = keyof typeof aliases;

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic, aliases })
  return idx
}

export const connectIDX = async (signer: TheSigner) => {
  const ceramic = Ceramic();
  const provider = await getProvider(signer);
  await ceramic.setDIDProvider(provider);
  const idx = createIDX(ceramic);
  return idx;
}

export const getDID = () => Ceramic().did!;
