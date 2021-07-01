import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { Wallet } from 'ethers';
import { ConnectContract } from '../contract';
import { MockIDX } from '../idx';
import { AccountMap, buildNewAccount } from '@thecointech/account';

const _devWallets: AccountMap = {};
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
  _devWallets[encryptedAccount.address] = encryptedAccount

  // Add a random decrypted wallet
  const randomAccount = buildNewAccount("Random Test", Wallet.createRandom());
  // connect to mocked services - normally this is done by "connect" call
  randomAccount.contract = ConnectContract();
  randomAccount.idx = new MockIDX() as any;
  _devWallets[randomAccount.address] = randomAccount

  _initial = randomAccount.address;
}

// Initialize
initDevWallets();
export const getAllAccounts = () => _devWallets;
export const getInitialAddress = () => _initial;
