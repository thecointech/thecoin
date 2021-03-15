//
// Store for loading named wallets.  Intended
// for use in the nodejs system.  Uses env variables
// to locate wallets, removing them from the build system

import { Contract, Signer, Wallet } from 'ethers';
import { ConnectContract } from '@the-coin/contract';
import { getDevLiveProvider } from '@the-coin/contract/provider';
import { AccountName, AccountId } from '@the-coin/contract/accounts';
import { ProgressCallback } from 'ethers/utils';
import { setGlobal } from '../globals';
import { log } from '@the-coin/logging';

let ConnectedContract: Contract|null = null;

// In dev:live environment, pull signers from
// local emulator for our system accounts
async function loadDevLiveSigner(name: AccountName) {
  const provider = getDevLiveProvider();
  return provider.getSigner(AccountId[name])
}

async function loadSigner(name: AccountName, callback?: ProgressCallback) {
  if (process.env.NODE_ENV === 'development') {
    // dev:live environment, we pull in the wallets from local emulator
    if (process.env.SETTINGS === 'live') {
      return loadDevLiveSigner(name);
    }
    else {
      // regular development environment, wallets should(?) be emulated (how?)
      return Wallet.createRandom();
    }
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
    setGlobal({
      wallets: {
        ...globalThis.__thecoin.wallets,
        [name]: signer,
      }
    })
  }
  return signer;
}


export async function getSigner(name: AccountName, callback?: ProgressCallback) : Promise<Signer> {
  return globalThis.__thecoin.wallets[name] ?? await loadAndStoreSigner(name, callback);
}

export async function getContract(name: AccountName, callback?: ProgressCallback) : Promise<Contract> {
	if (!ConnectedContract) {
		const wallet = await getSigner(name, callback);
		ConnectedContract = await ConnectContract(wallet);
		if (!ConnectedContract)
			throw new Error("Could not connect to Contract");
	}
	return ConnectedContract;
}
