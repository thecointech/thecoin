import { Worker } from 'node:worker_threads';
import { withTimeout } from '@thecointech/async';
import type { DecryptWalletOptions, WalletMessage } from './wallet.js';
import { HDNodeWallet, Wallet } from 'ethers';

const DEFAULT_TIMEOUT_MS = 60_000;

// The worker is loaded from the compiled build output. Run `yarn build` (or
// `yarn test`, which has `pretest: yarn build`) before running tests.
// (this is necessary to allow both built & un-built code -eg jest - to work)
const workerPath = new URL('../build/wallet.worker.mjs', import.meta.url);

export async function decryptWallet(
  encryptedJson: string,
  password: string,
  options: DecryptWalletOptions = {}
): Promise<HDNodeWallet|Wallet> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS, onProgress } = options;

  if (signal?.aborted) {
    throw new Error('Wallet decrypt aborted');
  }

  const worker = new Worker(workerPath);
  let settled = false;

  const cleanupSignal = (handler: () => void) => {
    signal?.removeEventListener('abort', handler);
  };

  try {
    return await withTimeout(
      new Promise<HDNodeWallet|Wallet>((resolve, reject) => {
        const abortHandler = () => {
          if (!settled) {
            settled = true;
            reject(new Error('Wallet decrypt aborted'));
          }
          void worker.terminate();
        };
        signal?.addEventListener('abort', abortHandler, { once: true });

        worker.on("message", (msg: WalletMessage) => {
          if (settled) return;
          if (msg.type === 'progress') {
            try {
              onProgress?.(msg.progress);
            } catch (err) {
              settled = true;
              cleanupSignal(abortHandler);
              reject(err);
            }
            return;
          }
          if (settled) return;
          settled = true;
          cleanupSignal(abortHandler);
          switch (msg.type) {
            case 'error':
              reject(new Error(msg.error));
              break;
            case 'mnemonic':
              resolve(HDNodeWallet.fromPhrase(msg.phrase, undefined, msg.path ?? undefined));
              break;
            case 'privateKey':
              resolve(new Wallet(msg.privateKey));
              break;
            default:
              reject(new Error('Wallet decrypt worker returned an invalid result'));
          }
        });

        worker.on('error', (err) => {
          if (settled) return;
          settled = true;
          cleanupSignal(abortHandler);
          reject(err);
        });

        worker.on('exit', (code) => {
          if (settled) return;
          settled = true;
          cleanupSignal(abortHandler);
          reject(new Error(`Wallet decrypt worker exited unexpectedly with code ${code}`));
        });

        worker.postMessage({ encryptedJson, password });
      }),
      timeoutMs,
      'decrypt wallet'
    );
  } finally {
    await worker.terminate();
  }
}
