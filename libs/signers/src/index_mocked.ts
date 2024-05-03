import { HDNodeWallet, Mnemonic } from 'ethers';
import { getAndCacheSigner } from './cache';
import { AccountId, AccountName } from './names';
import { getProvider } from '@thecointech/ethers-provider';

// Constant accounts in testing
const mnemonic = Mnemonic.fromPhrase("test test test test test test test test test test test junk");

export * from './names';
export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => {
    const index = AccountId[name];

    const wallet = HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`);
    return wallet.connect(getProvider());
  })
