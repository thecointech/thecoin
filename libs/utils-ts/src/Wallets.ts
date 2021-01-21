//
// Store for loading named wallets.  Intended
// for use in the nodejs system.  Uses env variables
// to locate wallets, removing them from the build system

import { Wallet, Contract } from 'ethers';
import {ConnectContract} from '@the-coin/contract';
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

async function loadWallet(name: string, callback?: ProgressCallback) {
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

export async function getWallet(name: string, callback?: ProgressCallback) : Promise<Wallet> {
  return globalThis.__thecoin.wallets[name] ?? loadWallet(name, callback);
}


export async function getContract(name: string, callback?: ProgressCallback) : Promise<Contract> {
	if (!ConnectedContract) {
		let wallet = await getWallet(name, callback);
		ConnectedContract = await ConnectContract(wallet);
		if (!ConnectedContract)
			throw "Could not connect to Contract";
	}
	return ConnectedContract;
}
