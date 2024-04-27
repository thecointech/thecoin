import { StatusType } from '@thecointech/broker-cad';
import { ConnectContract } from '@thecointech/contract-core';
import { getPluginDetails } from '@thecointech/contract-plugins';
import { getComposeDB } from '@thecointech/idx';
import { getSigner, AccountName } from '@thecointech/signers';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import { AccountState, buildNewAccount } from '../state';
import * as Browser from '../store';
import { AccountMap } from '../map';

let _devWallets: AccountMap = {};
let _initial = null as string|null;

const addRemoteAccount = async (name: AccountName, active: boolean) => {
  console.log("Adding devlive account");
  const signer = await getSigner(name);
  const address = NormalizeAddress(await signer.getAddress());
  const contract = await ConnectContract(signer);
  const plugins = await getPluginDetails(contract, address);

  _devWallets[address] = {
    ...buildNewAccount(name, address, signer),
    contract,
    plugins,
  }
  console.log('Loaded remote account: ' + address);
  if (active) {
    _initial = address;
    _devWallets[address].details.status = StatusType.Incomplete;
    _devWallets[address].idx = await getComposeDB(signer);
  }
}

// Add remote wallets.
export const getAllAccounts = async () => {
  if (Object.keys(_devWallets).length === 0) {
    _devWallets = await Browser.getAllAccounts();
    await addRemoteAccount('client1', true);
    await addRemoteAccount('client2', false);
    await addRemoteAccount('uberTester', false);
    await addRemoteAccount('saTester', false);
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
export const getStoredAccountData = (address: string) => _devWallets[address] ?? Browser.getStoredAccountData(address);
