import { SIGNER_CHANNEL } from './types';
import { getAndCacheSigner } from '../cache';
import { loadFromDisk } from '../fromDisk';
import { AccountName } from '../names';
import { log } from '@thecointech/logging';
import { getProvider } from '@thecointech/ethers-provider';
import type { IpcMain } from '@thecointech/electron-utils/types/ipc';
import type { Signer } from '@ethersproject/abstract-signer';

//
// This is exclusively running in node process on production environments
// (other environments will mock the signers or use RPC);
const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, async () => {
    // Normally, connecting to the contract enforces the
    // right provider, but in this instance we don't have a provider
    const wallet = await loadFromDisk(name);
    const provider = getProvider();
    return wallet.connect(provider);
  });

type SignerFn = Exclude<keyof Signer, "provider"|"_isSigner">;
//
// Running in node process in electron
export function bridge(ipc: IpcMain) {
  log.debug("Initializing signers IPC:handle...");
  // Listen for incoming requests
  ipc.handle(SIGNER_CHANNEL, async (_event, signerName: AccountName, func: SignerFn, args: any[]) => {
    const signer = await getSigner(signerName);
    if (typeof signer[func] != 'function')
      throw new Error(`Unknown function requested: ${signerName}):${func}`);
    //@ts-ignore - I can't figure out how to get TS to like this line
    return signer[func].apply(signer, args);
  });
}
