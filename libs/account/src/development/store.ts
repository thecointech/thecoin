import testWallet from './testAccount1.json' assert {type: "json"};
import { Wallet } from 'ethers';
import { ConnectContract } from '@thecointech/contract-core';
import { getPluginDetails } from '@thecointech/contract-plugins';
import { AccountMap } from '../map';
import { AccountState, buildNewAccount } from '../state';
import { getComposeDB } from '@thecointech/idx';

const _devAccounts: AccountMap = {};
let _initial: null|string = null;

// Make some wallets to test with.  There should be at
// least 1 unlocked wallet, and the locked TestAccNoT
async function initDevWallets() {
  const encryptedAccount = buildNewAccount("TestAccNoT", testWallet.address, testWallet as any);
  // We always add one encrypted wallet
  _devAccounts[encryptedAccount.address] = encryptedAccount

  // Add a random decrypted wallet
  const randomWallet = Wallet.createRandom();
  const randomAccount = buildNewAccount("Random Test", randomWallet.address, randomWallet);
  // connect to mocked services - normally this is done by "connect" call
  randomAccount.contract = await ConnectContract(randomAccount.signer);
  randomAccount.plugins = await getPluginDetails(randomAccount.contract);
  randomAccount.idx = await getComposeDB(randomAccount.signer);

  _devAccounts[randomAccount.address] = randomAccount
  _initial = randomAccount.address;

  randomWallet.encrypt("Random Test")
    .then(encrypted =>
      _devAccounts[randomAccount.address] = {
        ..._devAccounts[randomAccount.address],
        signer: JSON.parse(encrypted)
      })
    .catch(console.error)
    .finally(() => console.info("Random Test Encyption Complete"))
}

export const getStoredAccountData = (address: string) => _devAccounts[address];
export const storeAccount = (account: AccountState) => _devAccounts[account.address] = {...account};
export const deleteAccount = (account: AccountState) => delete _devAccounts[account.address];
export const getInitialAddress = () => _initial;
export const getAllAccounts = async () => {
  if (Object.keys(_devAccounts).length === 0) {
    await initDevWallets();
  }
  return {..._devAccounts}
};
