import { ConnectNetwork, SelfID } from '@self.id/web';
import { log } from '@thecointech/logging';
import type { Signer } from '@ethersproject/abstract-signer';
import { createAuthProvider } from './authProvider.js';

const CERAMIC_URL = process.env.CERAMIC_URL || 'http://localhost:7007'

export async function connectIDX(signer: Signer) : Promise<SelfID> {
  log.trace("IDX: Initiating connection...");

  const configEnv = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const config = await import(`./config.${configEnv}.json`);
  const self = await SelfID.authenticate({
    authProvider: await createAuthProvider(signer),
    ceramic: CERAMIC_URL,
    connectNetwork: process.env.THREEID_NETWORK as ConnectNetwork|undefined,
    model: config,
  });

  log.trace(`IDX: connected ${!!self?.id}...`);

  return self;
}
