//
// Get the named wallet, either from env variables

import { ProgressCallback } from "ethers/utils";
import { Wallet } from "ethers/wallet";
import { existsSync, readFileSync } from "fs";

// or from file system if name is a path.
export function loadEncrypted(name: string) {

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

export async function loadAndDecrypt(name: string, callback?: ProgressCallback) {
  const encrypted = loadEncrypted(name);
  const key = getKey(name);
  return Wallet.fromEncryptedJson(encrypted, key, callback);
}
