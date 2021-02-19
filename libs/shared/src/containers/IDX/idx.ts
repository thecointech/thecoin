import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import { TheSigner } from 'SignerIdent';
import { Ceramic } from './ceramic';
import config from './config.json';
import { getProvider } from './connect';

const aliases = {
  secretNotes: config.definitions.notes
}

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic, aliases })
  return idx
}

export const authenticate = async (signer: TheSigner) => {
  const ceramic = Ceramic();
  const provider = await getProvider(signer);
  await ceramic.setDIDProvider(provider);
  const idx = createIDX(ceramic);
  return idx;
}
