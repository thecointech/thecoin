import { connectAccount } from '@thecointech/signers/build/development';
import { AccountName } from '@thecointech/signers';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import { AccountState, buildNewAccount } from '../state';

const _devWallets = {} as Record<string, AccountState>;
let _initial = null as string|null;

async function addRemoteAccount(name: AccountName, active: boolean) {
  const signer = connectAccount(name)  as any;
  const address = NormalizeAddress(await signer.getAddress());

  _devWallets[address] = buildNewAccount(name, address, signer);
  console.log('Loaded remote account: ' + address);
  if (active) { _initial = address }
}

await addRemoteAccount('client1', true);
await addRemoteAccount('client2', false);

export const getAllAccounts = () => _devWallets;
export const getInitialAddress = () => _initial;
export const deleteAccount = (account: AccountState) => delete _devWallets[account.address];
export const storeAccount = (account: AccountState) => _devWallets[account.address] = account;
export const getStoredAccountData = (address: string) => _devWallets[address] ?? null;
