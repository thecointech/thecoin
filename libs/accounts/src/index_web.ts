import { AccountName } from '@the-coin/contract';
import { ProgressCallback } from 'ethers/utils';
import { baseContract, baseSigner } from './index_base';

async function loadSigner(name: AccountName) {
  if (process.env.NODE_ENV === 'development') {
    const { connectAccount } = await import('./development');
    return connectAccount(name);
  }
  throw new Error("Cannot load wallets by default in web in production");
}

export const getSigner = (name: AccountName, _callback?: ProgressCallback) =>
  baseSigner(name, () => loadSigner(name));

export const getContract = (name: AccountName, _callback?: ProgressCallback) =>
  baseContract(name, () => loadSigner(name));
