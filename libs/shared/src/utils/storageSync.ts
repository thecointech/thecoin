import { AccountState } from '../containers/Account/types';
import { AccountDict } from '../containers/AccountMap/types';
import { isSigner, SignerIdent } from '../SignerIdent';
import { IsValidAddress } from '@the-coin/utilities';
import { Deprecated_GetStored } from './storageSync_deprecated';

const ThrowIfNotValid = (data: any) => { 
  if (data.privateKey || !IsValidAddress(data.address)) 
    throw new Error("Cannot store unencrypted wallet") 
}

export function storeAccount(account: AccountState) {
  ThrowIfNotValid(account.signer);

  // Strip the contract from the account.
  let { contract, ...toStore } = account;
  const { address } = toStore.signer;
  if (isSigner(toStore.signer)) {
    // We can't directly save a signer (it has a circular reference)
    // but also it's data isn't particularily useful.
    let signerIdent: SignerIdent = {
      address,
      _isSigner: true,
    };
    toStore.signer = signerIdent as any;
  }
  // And that's it - write to local storage
  localStorage[address] = JSON.stringify(toStore);
}


export function getStoredAccountData(address: string): AccountState|null {
  const storedItem = localStorage.getItem(address);
  if (storedItem !== null) {
    const r = JSON.parse(storedItem) as AccountState
    if (r.signer.address && address === r.signer.address)
      return r;
  }
  return null;
}

// Utility function for fetching all stored accounts
export function readAllAccounts(): AccountDict {
  const allAccounts: AccountDict = {};
  for (let i = 0; i < localStorage.length; i++) {
    const raw = localStorage.key(i);
    if (!raw)
      continue;

    let account = IsValidAddress(raw) 
      ? getStoredAccountData(raw)
      : Deprecated_GetStored(raw);

    // Rough check that this is, indeed, a valid account
    const address = account?.signer?.address;
    if (address && IsValidAddress(address))
      allAccounts[address] = account!;
  }
  return allAccounts
}


//  Update an existing account with new state
// (Store transactions, balance etc);
export function updateStoredAccount(account: AccountState) {
  const existing = localStorage.getItem(account.signer.address);
  if (existing) {
    const { contract, signer, ...toStore} = account;
    const updated = {
      ...JSON.parse(existing),
      ...toStore
    }
    localStorage.setItem(account.signer.address, JSON.stringify(updated));
  }
}

//
// Delete the named account from localstorage (not tested)
export function deleteAccount(account: AccountState) {
  localStorage.removeItem(account.signer.address);
}
