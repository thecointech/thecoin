import { buildNewAccount } from '@thecointech/account';
import { connectAccount } from '@thecointech/signers/build/development';
import { NormalizeAddress } from '@thecointech/utilities/Address';

const _devWallets = {};
let _initial = null;

async function addRemoteAccount(name, active) {
  const signer = connectAccount(name)
  const address = NormalizeAddress(await signer.getAddress());
  signer.address = address;
  signer._isSigner = true;

  _devWallets[address] = buildNewAccount(name, signer);
  console.log('Loaded remote account: ' + address);
  if (active) { _initial = address }
}

await addRemoteAccount('client1', true);
await addRemoteAccount('client2', false);

export const getAllAccounts = () => _devWallets;
export const getInitialAddress = () => _initial;
export const deleteAccount = (account) => delete _devWallets[account.address];
export const storeAccount = (account) => _devWallets[account.address] = account;
export const getStoredAccountData = (address) => _devWallets[address] ?? null;
