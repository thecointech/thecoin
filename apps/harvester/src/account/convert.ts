import type { CoinAccount } from "@thecointech/store-harvester";
import type { HDNodeWallet } from "ethers";

export function toCoinAccount(mnemonic: HDNodeWallet, name: string): CoinAccount {
  return {
    address: mnemonic.address,
    name,
    mnemonic: {
      phrase: mnemonic.mnemonic!.phrase,
      path: mnemonic.path!,
      locale: mnemonic.mnemonic!.wordlist.locale,
    },
  }
}
