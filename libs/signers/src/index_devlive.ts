
import { Erc20Provider } from "@thecointech/ethers-provider/Erc20Provider";
import { getAndCacheSigner } from './cache.js';
import { AccountId, AccountName } from './names.js';

export * from './names.js';

// In dev:live environment, pull signers from
// local emulator for our system accounts
function loadDevLiveSigner(name: AccountName) {
  const provider = new Erc20Provider();
  const id = AccountId[name];
  return provider.getSigner(id)
}

export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => loadDevLiveSigner(name))
