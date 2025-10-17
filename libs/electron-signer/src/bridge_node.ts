import { GetSignerCallback, SIGNER_CHANNEL } from './types';
import { log } from '@thecointech/logging';
import type { IpcMain } from '@thecointech/electron-utils/types/ipc';
import type { Signer } from 'ethers';

//
// This is exclusively running in node process on production environments
// (other environments will mock the signers or use RPC);

// Only allow method names from Signer (exclude non-function properties)
type SignerFn = {
  [K in keyof Signer]-?: Signer[K] extends (...args: any[]) => any ? K : never
}[keyof Signer];

//
// Running in node process in electron
export function bridgeNode(ipc: IpcMain, getSigner: GetSignerCallback, logFunctionCalls?: boolean) {
  log.debug("Initializing signers IPC:handle...");
  // Listen for incoming requests
  ipc.handle(SIGNER_CHANNEL, async (_event, signerId: string, func: SignerFn, ...args: any[]) => {
    // In some contexts (e.g. harvester) we don't want to expose the full
    // suite of functions to the renderer process
    if (logFunctionCalls) {
      // throw new Error(`Unknown function requested: ${signerId}):${func}`);
      log.info(`function requested: ${signerId}):${func}`);
    }
    const signer = await getSigner(signerId);
    if (!signer) {
      throw new Error(`Unknown signer requested: ${signerId}`);
    }
    if (typeof signer[func] != 'function') {
      throw new Error(`Unknown function requested: ${signerId}):${func}`);
    }
    const method = signer[func] as (this: Signer, ...a: any[]) => any;
    return method.apply(signer, args);
  });
}
