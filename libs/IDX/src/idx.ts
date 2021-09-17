import Ceramic from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import { log } from '@thecointech/logging';
import type { Signer } from '@ethersproject/abstract-signer';

import { createAuthProvider } from './authProvider';
import { authenticateDID } from './did';
import { get3idConnect } from './threeId';

const CERAMIC_URL = process.env.CERAMIC_URL || 'http://localhost:7007'

export async function connectIDX(signer: Signer) {
  log.trace("IDX: Initiating connection...");
  const authProvider = await createAuthProvider(signer);
  const threeIdConnect = get3idConnect();
  await threeIdConnect.connect(authProvider)

  const ceramic = new Ceramic(CERAMIC_URL);
  const did = await authenticateDID(threeIdConnect, ceramic);
  log.trace(`IDX: Authenticated...`);

  await ceramic.setDID(did);
  const idx = createIDX(ceramic);
  log.debug("IDX: Connected!");
  return idx;
}

type Aliases = {
  details: string
};
export type IdxAlias = keyof Aliases;

async function createIDX(ceramic: Ceramic) {
  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  const config = await import(`./config.${config_env}.json`);
  const aliases: Aliases = {
    details: config.default.definitions.privateDetails
  }
  const idx = new IDX({ ceramic, aliases })
  return idx
}
