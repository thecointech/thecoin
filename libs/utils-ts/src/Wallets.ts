//
// Store for loading named wallets.  Intended
// for use in the nodejs system.  Uses env variables
// to locate wallets, removing them from the build system

import { Wallet, Contract } from 'ethers';
import { ConnectContract } from '@the-coin/contract';
import { getDevLiveProvider } from '@the-coin/contract/provider';
import { AccountName, AccountId } from '../../contract/build/accounts';
import { existsSync, readFileSync } from 'fs';
import { ProgressCallback } from 'ethers/utils';
import { setGlobal } from './globals';
import { log } from '@the-coin/logging';

let ConnectedContract: Contract|null = null;

//
// Get the named wallet, either from env variables
// or from file system if name is a path.
function loadEncrypted(name: string) {

  let wallet = existsSync(name)
    ? readFileSync(name, 'utf8')
    : process.env[`${name}_WALLET`];

  if (!wallet)
  {
    const path = process.env[`THECOIN_${name}_PATH`];
    if (path && existsSync(path))
      wallet = readFileSync(path, 'utf8');
  }
  if (!wallet)
    throw new Error(`Could not load wallet: ${name}`);

  return wallet;
}

function getKey(name: string) {
  const key = process.env[`THECOIN_${name}_KEY`];
  if (!key)
    throw new Error(`Could not load wallet key: ${name}`);

  return key;
}

// In dev:live environment, pull signers from
// local emulator for our system accounts
async function loadDevLiveSigner(name: AccountName) {
  const provider = getDevLiveProvider();
  return provider.getSigner(AccountId[name])
}

async function loadWallet(name: AccountName, callback?: ProgressCallback) {
  if (process.env.NODE_ENV === 'development') {
    // dev:live environment, we pull in the wallets from local emulator
    if (process.env.SETTINGS === 'live') {
      return await loadDevLiveSigner(name);
    }
    else {
      // regular development environment, wallets should(?) be emulated (how?)
    }
    return null;
  }
  else {
    const encrypted = loadEncrypted(name);
    const key = getKey(name);
    const wallet = await Wallet.fromEncryptedJson(encrypted, key, callback);
    log.info(`${name} wallet loaded`);
    setGlobal({
      wallets: {
        ...globalThis.__thecoin.wallets,
        [name]: wallet,
      }
    })
    return wallet;
  }
}

export async function getWallet(name: AccountName, callback?: ProgressCallback) : Promise<Wallet> {
  return globalThis.__thecoin.wallets[name] ?? loadWallet(name, callback);
}

export async function getContract(name: AccountName, callback?: ProgressCallback) : Promise<Contract> {
	if (!ConnectedContract) {
		const wallet = await getWallet(name, callback);
		ConnectedContract = await ConnectContract(wallet);
		if (!ConnectedContract)
			throw new Error("Could not connect to Contract");
	}
	return ConnectedContract;
}
