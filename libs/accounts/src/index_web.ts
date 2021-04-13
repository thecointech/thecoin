import { ProgressCallback } from 'ethers/utils';
import { AccountName } from './names';
import { baseSigner } from './index_base';
export * from './names';

async function loadSigner(name: AccountName) {
  if (process.env.NODE_ENV === 'development') {
    const { connectAccount } = await import('./development');
    return connectAccount(name);
  }
  throw new Error("Cannot load wallets by default in web in production");
}

export const getSigner = (name: AccountName, _callback?: ProgressCallback) =>
  baseSigner(name, () => loadSigner(name));

