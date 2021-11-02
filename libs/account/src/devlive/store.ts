import { ConnectContract } from 'contract-core';
import { getSigner, AccountName } from '@thecointech/signers';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import { AccountState, buildNewAccount } from '../state';
import * as Browser from '../store';

const _devWallets = Browser.getAllAccounts();
let _initial = null as string|null;
console.log("You should not see me in prod");
const addRemoteAccount = async (name: AccountName, active: boolean) => {
  console.log("Adding devlive account");
  const signer = await getSigner(name);
  const address = NormalizeAddress(await signer.getAddress());

  _devWallets[address] = buildNewAccount(name, address, signer);
  _devWallets[address].contract = ConnectContract(signer);
  console.log('Loaded remote account: ' + address);
  if (active) { _initial = address }
}
// Add remote wallets.
await addRemoteAccount('client1', true);
await addRemoteAccount('client2', false);

export const getAllAccounts = () => _devWallets;
export const getInitialAddress = () => _initial;
export const deleteAccount = (account: AccountState) => {
  Browser.deleteAccount(account);
  delete _devWallets[account.address];
}
// We need some persistence to be able to test account storage
export const storeAccount = Browser.storeAccount;
export const getStoredAccountData = (address: string) => _devWallets[address] ?? Browser.getStoredAccountData(address);
