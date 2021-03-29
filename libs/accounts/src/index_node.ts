import { AccountName } from '@the-coin/contract';
import { ProgressCallback } from 'ethers/utils';
import { baseContract, baseSigner } from './index_base';

// If running on GAE, check in secrets manager
const PrivilegedEnv = () => process.env["GAE_ENV"] || process.env["GOOGLE_APPLICATION_CREDENTIALS"];

async function loadSigner(name: AccountName, callback?: ProgressCallback) {
  if (process.env.NODE_ENV === 'development') {
    const { connectAccount } = await import('./development');
    return connectAccount(name);
  }
  else if (PrivilegedEnv()) {
    const { loadWallet } = await import('./server');
    return loadWallet(name);
  }
  else {
    const { loadAndDecrypt } = await import('./encrypted');
    return loadAndDecrypt(name, callback);
  }
}

export const getSigner = (name: AccountName, callback?: ProgressCallback) =>
  baseSigner(name, () => loadSigner(name, callback));

export const getContract = (name: AccountName, callback?: ProgressCallback) =>
  baseContract(name, () => loadSigner(name, callback));
