import { AccountState, DefaultAccountValues } from './state';
import type { AccountDetails } from './details';
import { AccountMap } from './map';
import { isRemote } from '@thecointech/signers';
import { IsValidAddress, NormalizeAddress } from '@thecointech/utilities/Address';

const ThrowIfNotEncrypted = (signer: any) => {
  if (typeof signer !== 'object') {
    throw new Error("Cannot store wallet, signer is not object");
  }
  // A valid storage must have:
  // - An address
  // - Version3
  // - a crypto object.  Validated on ethers wallets,
  //   but not tested on others.  Probably better to be
  //   too strict than too lenient.
  const valid = (
    signer.version === 3
    && signer.address
    && IsValidAddress(signer.address)
    && (signer.crypto || signer.Crypto)
  );
  if (!valid) {
    throw new Error("Cannot store wallet, invalid parameters for encrypted wallet");
  }
};

// Only the account name is persisted locally, as it is needed to display
// accounts before they are unlocked.  All other details are loaded from
// the broker (where preferences are canonical) once unlocked.
const toStoredDetails = (details: AccountDetails): AccountDetails => ({
  preferences: { accountName: details.preferences.accountName },
});

const PreferenceKeys = [
  "displayCurrency", "language", "storedOffline",
  "storedOnGoogle", "storedOnDropbox", "storedOnOneDrive",
] as const;

// Accounts stored prior to v0.7 kept `name` on the account, and
// preferences directly on `details`.  Convert to the current layout.
// Legacy preferences are kept (in memory) so the first connect can
// seed the broker with them.
function migrateStoredAccount(stored: any) {
  const { name, details, ...rest } = stored;
  const legacyPrefs = details?.preferences
    ? {}
    : Object.fromEntries(PreferenceKeys
        .filter(k => details?.[k] !== undefined)
        .map(k => [k, details[k]]));
  const preferences = {
    ...DefaultAccountValues.details.preferences,
    ...legacyPrefs,
    ...details?.preferences,
  };
  if (!preferences.accountName && name) {
    preferences.accountName = name;
  }
  return { ...rest, details: { preferences } };
}

export function storeAccount(account: AccountState) {

  // Strip the contract from the account.
  let { contract, ...toStore } = account;
  toStore.details = toStoredDetails(toStore.details);
  const { address } = toStore;
  if (isRemote(toStore.signer)) {
    // We can't directly save a signer (it has a circular reference)
    // but also it's data isn't particularily useful.
    toStore.signer = {
      _isRemote: true,
    } as any;
  }
  else {
    // Ensure local accounts are encrypted
    ThrowIfNotEncrypted(toStore.signer);
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
      ...migrateStoredAccount(JSON.parse(storedItem)),
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
      ...migrateStoredAccount(JSON.parse(existing)),
      ...toStore,
      details: toStoredDetails(toStore.details),
    }
    localStorage.setItem(account.address, JSON.stringify(updated));
  }
}

//
// Update the locally-cached account name (used while the account is locked)
export function setStoredAccountName(address: string, accountName: string) {
  const existing = localStorage.getItem(address);
  if (existing) {
    const stored = migrateStoredAccount(JSON.parse(existing));
    stored.details.preferences.accountName = accountName;
    localStorage.setItem(address, JSON.stringify(stored));
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
