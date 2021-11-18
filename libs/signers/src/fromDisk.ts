import type { ProgressCallback } from '@ethersproject/json-wallets';
import { Wallet } from "@ethersproject/wallet";
import { existsSync, readFileSync } from 'fs';
import { AccountName } from './names';

export async function loadFromDisk(name: AccountName, callback?: ProgressCallback) {
  const encrypted = loadEncrypted(name);
  const key = getPassword(name);
  return Wallet.fromEncryptedJson(encrypted, key, callback);
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
