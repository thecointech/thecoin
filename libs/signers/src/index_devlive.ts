
import { getProvider } from "@thecointech/ethers-provider/Erc20Provider";
import { getAndCacheSigner } from './cache';
import { AccountId, AccountName } from './names';

export * from './names';

// In dev:live environment, pull signers from
// local emulator for our system accounts
async function loadDevLiveSigner(name: AccountName) {
  const provider = await getProvider();
  const id = AccountId[name];
  return provider.getSigner(id)
}

export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => loadDevLiveSigner(name))
