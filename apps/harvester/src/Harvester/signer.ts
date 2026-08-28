import { existsSync } from 'fs';
import path from 'path';
import { HDNodeWallet } from 'ethers';
import { getProvider } from '@thecointech/ethers-provider';
import { CoinAccount } from '@thecointech/store-harvester';
import type { Signer } from 'ethers';
import { log } from '@thecointech/logging';
import { getProcessConfig, setProcessConfig } from './config';
import { rootFolder } from '../paths';
import { getEncryptedFile, setEncryptedFile } from './safeStorage';

const phraseFile = path.join(rootFolder, 'phr.bin');

export async function setCoinAccount(coinAccount: CoinAccount, phrase: string) {
  await setEncryptedFile(phraseFile, phrase);

  await setProcessConfig({ coinAccount });
  log.info({ address: coinAccount.address }, 'Stored coin account for {address}');
  return true;
}

export async function useSigner<T>(cb: (signer: Signer) => Promise<T>): Promise<T> {
  const cfg = await getProcessConfig();
  const derivationPath = cfg?.coinAccount?.mnemonic?.path;
  if (process.env.CONFIG_ENV === "development") {
    // In development, we may start with a seeded wallet.  In these
    // cases, re-generate the fixed wallet and continue.
    if (derivationPath === "default-seeded") {
      const wallet = HDNodeWallet.fromPhrase("test test test test test test test test test test test junk");
      const signer = wallet.connect(await getProvider());
      return cb(signer);
    }
  }

  if (!derivationPath || !existsSync(phraseFile)) {
    throw new Error("Coin account not set");
  }
  const phrase = await getEncryptedFile(phraseFile);
  const wallet = HDNodeWallet.fromPhrase(phrase, undefined, derivationPath);
  const signer = wallet.connect(await getProvider());
  return cb(signer);
}
