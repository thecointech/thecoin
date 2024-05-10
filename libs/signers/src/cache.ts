import { Signer } from "ethers"
import type { AccountName, NamedAccounts } from "./names"

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

// Allow manual initialization of signers.  This allows
// us to explicitly set signers for testing.
export function initCache(named: NamedAccounts) {
  Object.keys(named).forEach(key => {
    const signer = named[key as keyof NamedAccounts];
    if (signer) {
      __signers.set(key, signer);
    }
  });
}

