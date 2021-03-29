//
// Internal system for managing/caching signers used by TheCoin internally.
//
// Not suitable for use in web environments.
//

import type { Contract, Signer } from 'ethers';
import { ConnectContract } from '@thecointech/contract';
import { AccountName } from '@thecointech/contract/accounts';
import { log } from '@thecointech/logging';
import { cacheSigner } from './cache';

type Loader = () => Promise<Signer>;
async function loadAndStoreSigner(name: AccountName, loader: Loader) {
  const signer = await loader();
  if (!signer)
    log.error(`Could not load signer ${name}`);
  else {
    log.info(`${name} signer loaded`);
    cacheSigner(name, signer);
  }
  return signer;
}

export async function baseSigner(name: AccountName, loader: Loader) : Promise<Signer> {
  return globalThis.__accounts[name]?.signer ?? await loadAndStoreSigner(name, loader);
}

export async function baseContract(name: AccountName, loader: Loader) : Promise<Contract> {
  let contract = globalThis.__accounts[name]?.contract;

  if (!contract) {
		const wallet = await baseSigner(name, loader);
		contract = await ConnectContract(wallet);
  }
	if (!contract) {
    throw new Error(`Could not load contract for signer: ${name}`);
	}
	return contract;
}
