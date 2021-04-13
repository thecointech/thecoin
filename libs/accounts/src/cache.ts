import { Signer } from "ethers/abstract-signer"
import { AccountName } from "./names"

type AccountCache = {
  [name in AccountName]?: Signer
}

declare global {
  namespace globalThis {
    //  deepcode ignore no-var-keyword: var is necessary for this typing to work
    var __signers: AccountCache
  }
}

// initialize to empty
globalThis.__signers = {}

export function cacheSigner(name: AccountName, signer: Signer) {
  globalThis.__signers = {
    ...globalThis.__signers,
    [name]: signer
  }
}
