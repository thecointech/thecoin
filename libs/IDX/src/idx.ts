import { ConnectNetwork, SelfID } from '@self.id/web';
import { log } from '@thecointech/logging';
import { createAuthProvider } from './authProvider';
import { getConfig } from './config';
import { ConfigType } from './types';
import { createLink } from './link';
import type { Signer } from '@ethersproject/abstract-signer';

const CERAMIC_URL = process.env.CERAMIC_URL || 'http://localhost:7007'

export async function connectIDX(signer: Signer) : Promise<SelfID<ConfigType>> {
  log.trace("IDX: Initiating connection...");

  const authProvider = await createAuthProvider(signer);
  const aliases = await getConfig();
  const self = await SelfID.authenticate<ConfigType>({
    authProvider,
    ceramic: CERAMIC_URL,
    connectNetwork: process.env.THREEID_NETWORK as ConnectNetwork|undefined,
    aliases,
  });

  log.trace(`IDX: connected ${!!self?.id}...`);

  // Attempt link, do not await this.
  createLink(self, authProvider);
  return self;
}
