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

// Upper bounds on scrypt work/parallelization factors and the resulting
// memory footprint. Keystore JSON files can be untrusted input (e.g. an
// imported wallet file), so these parameters must be validated before we
// scale maxmem to match them - otherwise a crafted file with huge N/r/p
// could bypass Node's default memory guard and exhaust worker memory.
const MAX_SCRYPT_N = 1 << 20; // 1,048,576 - well above typical keystore N (usually 2^18)
const MAX_SCRYPT_R = 16;
const MAX_SCRYPT_P = 16;
const MAX_SCRYPT_MAXMEM = 512 * 1024 * 1024; // 512 MiB hard cap

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
  if (N > MAX_SCRYPT_N || r > MAX_SCRYPT_R || p > MAX_SCRYPT_P) {
    throw new Error(`scrypt parameters exceed allowed limits (N=${N}, r=${r}, p=${p})`);
  }
  const maxmem = Math.max(128 * N * r * p * 2, 64 * 1024 * 1024);
  if (maxmem > MAX_SCRYPT_MAXMEM) {
    throw new Error(`scrypt memory requirement (${maxmem} bytes) exceeds allowed limit`);
  }

  postMessage({ type: 'progress', progress: 0 });
  const derived = await new Promise<Uint8Array>((resolve, reject) => {
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
