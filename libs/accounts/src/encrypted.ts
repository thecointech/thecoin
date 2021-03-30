//
// Get the named wallet, either from env variables

import { ProgressCallback } from "ethers/utils";
import { Wallet } from "ethers/wallet";
import { existsSync, readFileSync } from "fs";
import { AccountName } from "./names";

// or from file system if name is a path.
function loadEncrypted(name: AccountName) {

  let wallet = process.env[`WALLET_${name}`];

  if (!wallet)
  {
    const path = process.env[`WALLET_${name}_PATH`];
    console.log(path);
    if (path) {
      if (!existsSync(path))
        throw new Error(`Could not load ${name} from path: ${path}`);
      wallet = readFileSync(path, 'utf8');
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

// This function is referenced directly from libs/contract deployment
export function loadFromPK(name: AccountName) {
  const pk = process.env[`WALLET_${name}_KEY`];
  if (pk)
    return new Wallet(pk);
  return undefined;
}

export async function loadAndDecrypt(name: AccountName, callback?: ProgressCallback) {
  const encrypted = loadEncrypted(name);
  const key = getPassword(name);
  return Wallet.fromEncryptedJson(encrypted, key, callback);
}

export async function loadFromEnv(name: AccountName, callback?: ProgressCallback) {
  return loadFromPK(name) ?? await loadAndDecrypt(name, callback);
}
