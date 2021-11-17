import testWallet from './testAccount1.json';
import { Wallet } from 'ethers';
import { ConnectContract } from '@thecointech/contract-core';
import { AccountMap } from '../map';
import { AccountState, buildNewAccount } from '../state';
import { connectIDX } from '@thecointech/idx';

let _devAccounts: AccountMap = {};
let _initial: null|string = null;

// Make some wallets to test with.  There should be at
// least 1 unlocked wallet, and the locked TestAccNoT
// We cannot use top-level await because it breaks Storybook (v6)
function initDevWallets() {
  const encryptedAccount = buildNewAccount("TestAccNoT", testWallet.address, testWallet as any);
  // We always add one encrypted wallet
  _devAccounts[encryptedAccount.address] = encryptedAccount

  // Add a random decrypted wallet
  const randomWallet = Wallet.createRandom();
  const randomAccount = buildNewAccount("Random Test", randomWallet.address, randomWallet);
  // connect to mocked services - normally this is done by "connect" call
  randomAccount.contract = ConnectContract(randomAccount.signer);


  _devAccounts[randomAccount.address] = randomAccount
  _initial = randomAccount.address;
  // Complete
  connectIDX(randomWallet)
    .then(idx => {
      _devAccounts[randomAccount.address] = {
        ..._devAccounts[randomAccount.address],
        idx,
      }
    });
  randomWallet.encrypt("Random Test")
    .then(encrypted =>
      _devAccounts[randomAccount.address] = {
        ..._devAccounts[randomAccount.address],
        signer: JSON.parse(encrypted)
      })
    .catch(console.error)
    .finally(() => console.info("Random Test Encyption Complete"))
}
initDevWallets();

export const getStoredAccountData = (address: string) => _devAccounts[address];
export const storeAccount = (account: AccountState) => _devAccounts[account.address] = {...account};
export const deleteAccount = (account: AccountState) => delete _devAccounts[account.address];
export const getAllAccounts = () => ({..._devAccounts});
export const getInitialAddress = () => _initial;
