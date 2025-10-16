import { AccountState, DefaultAccountValues } from './state';
import { AccountMap } from './map';
import { isRemote } from '@thecointech/signers';
import { IsValidAddress, NormalizeAddress } from '@thecointech/utilities/Address';

const ThrowIfNotValid = async (signer: any) => {
  if (typeof signer !== 'object') {
    throw new Error("Cannot store wallet, signer is not object")
  }
  // A valid storage must have:
  // - An address
  // - Version3
  // This may be a little bit too strict, as it's more strict than isKeystoreJson
  const valid = (
    signer.version == 3 &&
    signer.address &&
    IsValidAddress(signer.address)
  );
  if (!valid) {
    throw new Error("Cannot store wallet, invalid parameters for encrypted wallet")
  }
}

export async function storeAccount(account: AccountState) {
  await ThrowIfNotValid(account.signer);

  // Strip the contract from the account.
  let { contract, ...toStore } = account;
  const { address } = toStore;
  if (isRemote(toStore.signer)) {
    // We can't directly save a signer (it has a circular reference)
    // but also it's data isn't particularily useful.
    toStore.signer = {
      _isRemote: true,
    } as any;
  }
  // And that's it - write to local storage
  localStorage[address] = JSON.stringify(toStore);
}

export function getStoredAccountData(address: string): AccountState | null {

  if (!IsValidAddress(address))
    return null;

  const normAddress = NormalizeAddress(address);

  if (normAddress != address) {
    const switcheroo = localStorage.getItem(address);
    localStorage.setItem(normAddress, switcheroo!);
    localStorage.removeItem(address);
  }

  const storedItem = localStorage.getItem(normAddress);

  if (storedItem !== null) {
    const r: AccountState = {
      ...DefaultAccountValues,
      ...JSON.parse(storedItem),
      address: normAddress,
    }

    if (NormalizeAddress(r.address) === normAddress) {
      return r;
    }
  }
  return null;
}

// Utility function for fetching all stored accounts
export async function getAllAccounts(): Promise<AccountMap> {
  const allAccounts: AccountMap = {};
  for (let i = 0; i < localStorage.length; i++) {
    const raw = localStorage.key(i);
    if (!raw)
      continue;

    let account = getStoredAccountData(raw);
    if (account) {
      const { address, signer } = account;

      // Rough check that this is, indeed, a valid account
      if (address && IsValidAddress(address) && signer !== undefined) {
        allAccounts[address] = account!;
      }
    }
  }
  return allAccounts
}


//  Update an existing account with new state
// (Store transactions, balance etc);
export function updateStoredAccount(account: AccountState) {
  const existing = localStorage.getItem(account.address);
  if (existing) {
    const { contract, signer, ...toStore } = account;
    const updated = {
      ...JSON.parse(existing),
      ...toStore
    }
    localStorage.setItem(account.address, JSON.stringify(updated));
  }
}

//
// Delete the named account from localstorage (not tested)
export function deleteAccount(account: AccountState) {
  localStorage.removeItem(account.address);
}

//
// Get the initial address (last used)
export function getInitialAddress() {
  return null; // TODO
}

//
// Set the initial address (last used)
export function setInitialAddress() {
}
