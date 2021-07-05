
import { Wallet, providers } from 'ethers';
import { AccountId, AccountName } from './names';

// In dev:live environment, pull signers from
// local emulator for our system accounts
function loadDevLiveSigner(name: AccountName) {
  const provider = new providers.JsonRpcProvider(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
  const id = AccountId[name];
  return provider.getSigner(id)
}

export function connectAccount(name: AccountName) {
  // dev:live environment, we pull in the wallets from local emulator
  if (process.env.SETTINGS === 'live') {
    return loadDevLiveSigner(name);
  }
  else {
    // regular development environment, wallets should(?) be emulated (how?)
    return Wallet.createRandom();
  }
}
