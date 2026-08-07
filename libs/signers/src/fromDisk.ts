import type { ProgressCallback } from 'ethers';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { AccountName } from './names';
import { getProvider } from '@thecointech/ethers-provider';
import { getSecret } from '@thecointech/secrets/live';
import { decryptWallet } from '@thecointech/utilities/wallet';
import { log } from '@thecointech/logging';

export async function loadFromDisk(name: AccountName, callback?: ProgressCallback) {
  log.debug({ name }, 'Signer {name}: loading wallet from disk');
  const encrypted = loadEncrypted(name);
  const key = await getPassword(name);
  const wallet = await decryptWallet(encrypted, key, {
    timeoutMs: 60_000,
    onProgress: callback,
  });
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
