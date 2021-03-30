import { AccountName } from "@thecointech/contract"
import { Contract } from "ethers/contract"
import { Signer } from "ethers/abstract-signer"

type CacheEntry = {
  signer: Signer,
  contract?: Contract,
}
type AccountCache = {
  [name in AccountName]?: CacheEntry
}

declare global {
  namespace globalThis {
    //  deepcode ignore no-var-keyword: var is necessary for this typing to work
    var __accounts: AccountCache
  }
}

// initialize to empty
globalThis.__accounts = {}

export function cacheSigner(name: AccountName, signer: Signer) {
  globalThis.__accounts = {
    ...globalThis.__accounts,
    [name]: {
      signer,
    }
  }
}
export function cacheContract(name: AccountName, contract: Contract) {
  globalThis.__accounts = {
    ...globalThis.__accounts,
    [name]: {
      signer: globalThis.__accounts[name]!.signer,
      contract,
    }
  }
}
