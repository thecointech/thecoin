import { AccountId, AccountName } from '@the-coin/contract';
import { getDevLiveProvider } from '@the-coin/contract/provider';
import { Wallet } from 'ethers/wallet';

// In dev:live environment, pull signers from
// local emulator for our system accounts
async function loadDevLiveSigner(name: AccountName) {
  const provider = getDevLiveProvider();
  return provider.getSigner(AccountId[name])
}

export async function connectAccount(name: AccountName) {
  // dev:live environment, we pull in the wallets from local emulator
  if (process.env.SETTINGS === 'live') {
    return loadDevLiveSigner(name);
  }
  else {
    // regular development environment, wallets should(?) be emulated (how?)
    return Wallet.createRandom();
  }
}
