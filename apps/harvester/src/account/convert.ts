import type { CoinAccount } from "@thecointech/store-harvester";
import type { HDNodeWallet } from "ethers";

export function toCoinAccount(mnemonic: HDNodeWallet, name: string): CoinAccount {
  return {
    address: mnemonic.address,
    name,
    mnemonic: {
export function toCoinAccount(mnemonic: HDNodeWallet, name: string): CoinAccount {
  if (!mnemonic.mnemonic || !mnemonic.path) {
    throw new Error("HDNodeWallet must have mnemonic and path properties");
  }
  return {
    address: mnemonic.address,
    name,
    mnemonic: {
      phrase: mnemonic.mnemonic.phrase,
      path: mnemonic.path,
      locale: mnemonic.mnemonic.wordlist.locale,
    },
  }
}
    },
  }
}
