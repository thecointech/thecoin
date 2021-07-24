import { Signer } from "@ethersproject/abstract-signer"
import { AccountName } from "./names"

declare global {
  namespace globalThis {
    //  deepcode ignore no-var-keyword: var is necessary for this typing to work
    var __signers: Map<string, Signer>;
  }
}

// initialize to empty
globalThis.__signers = new Map<string, Signer>();

export async function getAndCacheSigner(name: AccountName, creator: () => Promise<Signer>|Signer) : Promise<Signer> {
  const cached = globalThis.__signers.get(name);
  if (cached) return cached;

  const signer = await creator();
  return __signers
    .set(name, signer)
    .get(name)!;
}
