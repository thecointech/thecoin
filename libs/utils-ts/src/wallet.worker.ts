import { parentPort } from 'node:worker_threads';
import { Wallet } from 'ethers';
import { scrypt as nodeScrypt } from 'node:crypto';
// @ts-expect-error this will be fixed when we switch to a newer moduleresolution
import { scrypt } from 'ethers/crypto';
import type { WalletMessage } from './wallet';

interface DecryptMessage {
  encryptedJson: string;
  password: string;
}

const postMessage = (msg: WalletMessage) => {
  parentPort?.postMessage(msg);
};

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
  _progress?: ScryptProgressCallback
): Promise<Uint8Array> => {
  postMessage({ type: 'progress', progress: 0 });
  const derived = await new Promise<Uint8Array>((resolve, reject) => {
    const maxmem = Math.max(128 * N * r * p * 2, 64 * 1024 * 1024);
    nodeScrypt(passwd, salt, dkLen, { N, r, p, maxmem }, (err, key) => {
      if (err) reject(err);
      else resolve(Uint8Array.from(key));
    });
  });
  postMessage({ type: 'progress', progress: 1 });
  return derived;
});

parentPort?.on("message", async ({ encryptedJson, password }: DecryptMessage) => {
  try {
    const wallet = await Wallet.fromEncryptedJson(encryptedJson, password);
    if ("mnemonic" in wallet && wallet.mnemonic) {
      postMessage({ type: 'mnemonic', phrase: wallet.mnemonic.phrase, path: wallet.path })
    } else {
      postMessage({ type: 'privateKey', privateKey: wallet.privateKey })
    }
  } catch (err: any) {
    postMessage({ type: 'error', error: err.message ?? String(err) });
  }
});
