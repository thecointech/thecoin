//
// Internal system for managing/caching signers used by TheCoin internally.
//
// Not suitable for use in web environments.
//

import type { Signer } from 'ethers';
import { log } from '@thecointech/logging';
import { cacheSigner } from './cache';
import { AccountName } from './names';

type Loader = () => Promise<Signer>;
async function loadAndStoreSigner(name: AccountName, loader: Loader) {
  const signer = await loader();
  if (!signer)
    log.error(`Could not load signer ${name}`);
  else {
    cacheSigner(name, signer);
  }
  return signer;
}

export async function baseSigner(name: AccountName, loader: Loader) : Promise<Signer> {
  return globalThis.__signers[name] ?? await loadAndStoreSigner(name, loader);
}

