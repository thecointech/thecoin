import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { Wallet } from 'ethers';
import { ConnectContract } from '../contract';
import { MockIDX } from '../idx';
import { AccountMap, AccountState, buildNewAccount } from '@thecointech/account';

const _devAccounts: AccountMap = {};
let _initial: null|string = null;

export const wallets = [
  {
    id: "123",
    name: "TestAccNoT",
    type: "Type?",
    wallet: JSON.stringify(testWallet),
  },
  {
    id: "345",
    name: "TestAccNoT Another",
    type: "Type?",
    wallet: JSON.stringify(testWallet),
  },
  {
    id: "789",
    name: "This is my.wallet.json",
    type: "Type?",
    wallet: JSON.stringify(Thisismy),
  }
];

// Make some wallets to test with.  There should be at
// least 1 unlocked wallet, and the locked TestAccNoT
function initDevWallets() {
  const encrypted = wallets[0];
  const encryptedAccount = buildNewAccount(encrypted.name, JSON.parse(encrypted.wallet));
  // We always add one encrypted wallet
  _devAccounts[encryptedAccount.address] = encryptedAccount

  // Add a random decrypted wallet
  const randomAccount = buildNewAccount("Random Test", Wallet.createRandom());
  // connect to mocked services - normally this is done by "connect" call
  randomAccount.contract = ConnectContract();
  randomAccount.idx = new MockIDX() as any;
  _devAccounts[randomAccount.address] = randomAccount

  _initial = randomAccount.address;
}

// Initialize
initDevWallets();

export const getStoredAccountData = (address: string) => ({
  ..._devAccounts[address],
  // We don't store original wallets, so just
  // strip the signer from the data to remove its privateKey
  signer: { _isSigner: false }
});
export const storeAccount = (account: AccountState) => _devAccounts[account.address] = account;
export const deleteAccount = (account: AccountState) => delete _devAccounts[account.address];
export const getAllAccounts = () => _devAccounts;
export const getInitialAddress = () => _initial;
