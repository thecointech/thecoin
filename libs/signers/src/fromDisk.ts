import type { ProgressCallback } from 'ethers';
import { Wallet } from "ethers";
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { AccountName } from './names';
import { getProvider } from '@thecointech/ethers-provider';
import { getSecret } from '@thecointech/secrets/live';
import { withTimeout } from '@thecointech/async';
import { log } from '@thecointech/logging';
import { scrypt as nodeScrypt } from 'node:crypto';
// @ts-expect-error
import { scrypt } from 'ethers/crypto';

type ScryptProgressCallback = (percent: number) => void;

// Use Node's native scrypt instead of the pure-JS implementation to avoid
// extremely slow decryption inside Docker / resource-constrained environments.
scrypt.register(async (
  passwd: Uint8Array,
  salt: Uint8Array,
  N: number,
  r: number,
  p: number,
  dkLen: number,
  progress?: ScryptProgressCallback
): Promise<Uint8Array> => {
  if (progress) progress(0);
  const derived = await new Promise<Uint8Array>((resolve, reject) => {
    const maxmem = Math.max(128 * N * r * p * 2, 64 * 1024 * 1024);
    nodeScrypt(passwd, salt, dkLen, { N, r, p, maxmem }, (err, key) => {
      if (err) reject(err);
      else resolve(Uint8Array.from(key));
    });
  });
  if (progress) progress(1);
  return derived;
});

export async function loadFromDisk(name: AccountName, callback?: ProgressCallback) {
  log.debug({ name }, 'Signer {name}: loading wallet from disk');
  const encrypted = loadEncrypted(name);
  const key = await getPassword(name);
  const wallet = await withTimeout(
    Wallet.fromEncryptedJson(encrypted, key, callback),
    60_000,
    `decrypt signer ${name}`
  );
  const provider = await getProvider();
  return wallet.connect(provider);
}

// or from file system if name is a path.
function loadEncrypted(name: AccountName) {

  if (!process.env.THECOIN_SECRETS) {
    throw new Error("THECOIN_SECRETS not set");
  }
  if (!process.env.CONFIG_NAME) {
    throw new Error("CONFIG_NAME not set");
  }
  const walletPath = join(
    process.env.THECOIN_SECRETS,
    process.env.CONFIG_NAME,
    "wallets",
    `${name}.json`
  );
  if (!existsSync(walletPath))
    throw new Error(`Could not load ${name} from path: ${walletPath}`);
  return readFileSync(walletPath, 'ascii');
}

async function getPassword(name: AccountName) {
  return getSecret(`Signer${name}Pwd`);
}
