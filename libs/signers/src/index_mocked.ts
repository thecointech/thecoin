import { Wallet } from 'ethers';
import { getAndCacheSigner } from './cache';
import { AccountId, AccountName } from './names';

// Constant accounts in testing
const mnemonic = "test test test test test test test test test test test junk";

export * from './names';
export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => {
    const index = AccountId[name];
    const wallet = Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`);
    return wallet;
  })
