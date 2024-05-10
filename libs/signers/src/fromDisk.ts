import type { ProgressCallback } from 'ethers';
import { Wallet } from "ethers";
import { existsSync, readFileSync } from 'fs';
import type { AccountName } from './names';
import { getProvider } from '@thecointech/ethers-provider';

export async function loadFromDisk(name: AccountName, callback?: ProgressCallback) {
  const encrypted = loadEncrypted(name);
  const key = getPassword(name);
  const wallet = await Wallet.fromEncryptedJson(encrypted, key, callback);
  return wallet.connect(getProvider());
}
// or from file system if name is a path.
function loadEncrypted(name: AccountName) {

  let wallet = process.env[`WALLET_${name}`];

  if (!wallet)
  {
    const path = process.env[`WALLET_${name}_PATH`];
    if (path) {
      if (!existsSync(path))
        throw new Error(`Could not load ${name} from path: ${path}`);
      wallet = readFileSync(path, 'ascii');
    }
  }
  if (!wallet)
    throw new Error(`Could not load wallet: ${name}`);

  return wallet;
}

function getPassword(name: AccountName) {
  const key = process.env[`WALLET_${name}_PWD`];
  if (!key) {
    throw new Error(`Could not load wallet key: ${name}`);
  }
  return key;
}
