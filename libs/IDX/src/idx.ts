import { SelfID as SelfIdImp } from '@self.id/web'
import type { SelfID} from '@self.id/web';
import { log } from '@thecointech/logging';
import type { Signer } from '@ethersproject/abstract-signer';
import { createAuthProvider } from './authProvider';

import config from "./config.devlive.json";

const CERAMIC_URL = process.env.CERAMIC_URL || 'http://localhost:7007'

export async function connectIDX(signer: Signer) : Promise<SelfID> {
  log.trace("IDX: Initiating connection...");

  const self = await SelfIdImp.authenticate({
    authProvider: await createAuthProvider(signer),
    ceramic: CERAMIC_URL,
    connectNetwork: 'testnet-clay',
    model: config,
  });

  return self;
}

export type IdxAlias = keyof typeof config["definitions"];

