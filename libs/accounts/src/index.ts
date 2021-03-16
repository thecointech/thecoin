//
// Internal system for managing/caching signers used by TheCoin internally.
//
// Not suitable for use in web environments.
//

import type { Contract, Signer } from 'ethers';
import { ConnectContract } from '@the-coin/contract';
import { AccountName } from '@the-coin/contract/accounts';
import { ProgressCallback } from 'ethers/utils';
import { log } from '@the-coin/logging';
import { cacheSigner } from './cache';

// If running on GAE, check in secrets manager
const GAE_ENV = process.env["GAE_ENV"] || process.env["GOOGLE_APPLICATION_CREDENTIALS"];

async function loadSigner(name: AccountName, callback?: ProgressCallback) {
  if (process.env.NODE_ENV === 'development') {
    const { connectAccount } = await import('./emulated');
    return await connectAccount(name);
  }
  else if (GAE_ENV) {
    const { loadWallet } = await import('./ga-secrets');
    return loadWallet(`WALLET_${name}`);
  }
  else {
    const { loadAndDecrypt } = await import('./encrypted');
    return loadAndDecrypt(name, callback);
  }
}

async function loadAndStoreSigner(name: AccountName, callback?: ProgressCallback) {
  const signer = await loadSigner(name, callback);
  if (!signer)
    log.warn(`Could not load signer ${name}`);
  else {
    log.info(`${name} signer loaded`);
    cacheSigner(name, signer);
  }
  return signer;
}


export async function getSigner(name: AccountName, callback?: ProgressCallback) : Promise<Signer> {
  return globalThis.__accounts[name]?.signer ?? await loadAndStoreSigner(name, callback);
}

export async function getContract(name: AccountName, callback?: ProgressCallback) : Promise<Contract> {
  let contract = globalThis.__accounts[name]?.contract;

  if (!contract) {
		const wallet = await getSigner(name, callback);
		contract = await ConnectContract(wallet);
  }
	if (!contract) {
    throw new Error(`Could not load contract for signer: ${name}`);
	}
	return contract;
}
