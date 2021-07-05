import { ProgressCallback } from 'ethers/utils';
import { AccountName } from './names';
import { baseSigner } from './index_base';
export * from './names';

// If running on GAE, check in secrets manager
const PrivilegedEnv = () => process.env["GAE_ENV"] || process.env["GOOGLE_APPLICATION_CREDENTIALS"];

async function loadSigner(name: AccountName, callback?: ProgressCallback) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    const { connectAccount } = await import('./development');
    return connectAccount(name);
  }
  else if (PrivilegedEnv()) {
    const { loadWallet } = await import('./server');
    return loadWallet(name);
  }
  else {
    const { loadFromEnv } = await import('./encrypted');
    return loadFromEnv(name, callback);
  }
}

export const getSigner = (name: AccountName, callback?: ProgressCallback) =>
  baseSigner(name, () => loadSigner(name, callback));
