import testWallet from './testAccount1.json';
import { Wallet } from 'ethers';
import { ConnectContract } from '@thecointech/contract';
import { connectIDX } from '@thecointech/idx';
import { AccountMap, AccountState, buildNewAccount } from '..';

const _devAccounts: AccountMap = {};
let _initial: null|string = null;

// Make some wallets to test with.  There should be at
// least 1 unlocked wallet, and the locked TestAccNoT
async function initDevWallets() {
  const encryptedAccount = buildNewAccount("TestAccNoT", testWallet as any);
  // We always add one encrypted wallet
  _devAccounts[encryptedAccount.address] = encryptedAccount

  // Add a random decrypted wallet
  const randomAccount = buildNewAccount("Random Test", Wallet.createRandom());
  // connect to mocked services - normally this is done by "connect" call
  // It is OK for these calls to complete after this fn exits
  ConnectContract(randomAccount.signer).then(c => randomAccount.contract = c);
  connectIDX(randomAccount.signer).then(i => randomAccount.idx = i ?? undefined);
  _devAccounts[randomAccount.address] = randomAccount

  _initial = randomAccount.address;
}
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
