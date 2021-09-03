
import { JsonRpcProvider } from "@ethersproject/providers";
import { getAndCacheSigner } from './cache';
import { AccountId, AccountName } from './names';

export * from './names';

// In dev:live environment, pull signers from
// local emulator for our system accounts
function loadDevLiveSigner(name: AccountName) {
  const provider = new JsonRpcProvider(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
  const id = AccountId[name];
  return provider.getSigner(id)
}

export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => loadDevLiveSigner(name))
