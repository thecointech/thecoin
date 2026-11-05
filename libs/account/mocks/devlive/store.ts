import { ContractCore } from '@thecointech/contract-core';
import { getPluginDetails } from '@thecointech/contract-plugins';
import { getSigner, AccountName } from '@thecointech/signers';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import { AccountState, buildNewAccount, getAccountName } from '@/state';
import * as Browser from '@/store';
import type { AccountMap } from '@/map';
import { Wallet } from 'ethers';

let _devWallets: AccountMap = {};
let _initial = null as string|null;

const addRemoteAccount = async (name: AccountName, active: boolean) => {
  console.log("Adding devlive account");
  const signer = await getSigner(name);
  const address = NormalizeAddress(await signer.getAddress());
  const contract = await ContractCore.connect(signer);
  const plugins = await getPluginDetails(contract, address);

  _devWallets[address] = {
    ...buildNewAccount(name, address, signer),
    contract,
    plugins,
  }
  console.log('Loaded remote account: ' + address);
  if (active) {
    _initial = address;
    // _devWallets[address].details.basic = {
    //   kycStage: "started",
    //   kycUpdated: DateTime.now(),
    // };
  }
}

const addLocalAccount = async (name: string) => {
  // Constant phrase for persistence.  This allows other apps (harvester) to load this account
  // and then view changes back in the webpage.
  const signer = Wallet.fromPhrase("sing hole north sorry glow frame tomorrow tiger purity excite album squirrel");
  const encrypted = await signer.encrypt("test");
  const address = NormalizeAddress(signer.address);
  // We should allow building accounts with encrypted signers
  _devWallets[address] = buildNewAccount(name, address, JSON.parse(encrypted));
  // Add this to localStorage to allow the harvester to fetch it
  storeAccount(_devWallets[address]);
}

// Add remote wallets.
export const getAllAccounts = async () => {
  if (Object.keys(_devWallets).length === 0) {
    _devWallets = await Browser.getAllAccounts();
    // Remove any existing "Local1" accounts;
    Object.keys(_devWallets).forEach((address) => {
      if (getAccountName(_devWallets[address]) === "Local1") {
        deleteAccount(_devWallets[address]);
        delete _devWallets[address];
      }
    });
    await addRemoteAccount('Client1', true);
    await addRemoteAccount('Client2', false);
    await addRemoteAccount('UberTester', false);
    await addRemoteAccount('SaTester', false);
    await addLocalAccount("Local1");

    // await addRemoteAccount('TestDemoAccount', false);
  }
  return _devWallets;
}
export const getInitialAddress = () => _initial;
export const deleteAccount = (account: AccountState) => {
  Browser.deleteAccount(account);
  delete _devWallets[account.address];
}
// We need some persistence to be able to test account storage
export const storeAccount = Browser.storeAccount;
export const setStoredAccountName = (address: string, accountName: string) => {
  Browser.setStoredAccountName(address, accountName);
  const account = _devWallets[address];
  if (account) {
    account.details.preferences = { ...account.details.preferences, accountName };
  }
}
export const getStoredAccountData = (address: string) => _devWallets[address] ?? Browser.getStoredAccountData(address);
