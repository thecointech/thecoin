import { Wallet } from 'ethers';
import { ContainerState } from './types';

const PREFIX = 'lcl_wal_';
const PREFIX_LEN = PREFIX.length;
function Strip(name: string | null): string {
  if (name != null && name.startsWith(PREFIX)) {
    return name.substring(PREFIX_LEN);
  }
  return '';
}
function Pad(name: string): string {
  return PREFIX + name;
}
function GetStored(name): Wallet | null {
  const storedItem = localStorage.getItem(Pad(name));
  if (storedItem !== null) {
    const wallet = JSON.parse(storedItem) as Wallet;
    // Ensure valid wallet by checking address
    if (wallet.address) return wallet;
  }
  return null;
}
function SetStored(name: string, account: Wallet) {
  localStorage[Pad(name)] = JSON.stringify(account);
}

//
// Read all accounts from local storage, return in array
export function ReadAllAccounts(): ContainerState {
  const allAccounts = new Map<string, Wallet>();
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const name = Strip(localStorage.key(i));
    if (name != null) {
      allAccounts[name] = GetStored(name);
    }
  }
  return allAccounts;
}

//
//  Store a single account, assumes this account has not yet
//  been decrypted
export function StoreSingleAccount(name: string, account: Wallet) {
  // Do not store decrypted account
  if (account.privateKey) {
    const storedItem = GetStored(name);
    if (
      storedItem == null ||
      storedItem.address.toLowerCase() != account.address.toLowerCase()
    ) {
      throw "Unable to store named account: It's name clashes with existing account";
    }
    return false;
  }

  SetStored(name, account);
  return true;
}

//
//  Replace all existing accounts with ones in this list.
export function StoreAllAccounts(accounts: ContainerState) {
  // First, delete any extra accounts that are not stored
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const key = localStorage.key(i);
    if (key != null && key.startsWith(PREFIX)) {
      const name = Strip(key);
      if (!(name in accounts)) {
      }
    }
  }
  accounts.forEach((account, name) => {
    StoreSingleAccount(name, account);
  });
}

//
// Delete the named account from localstorage (not tested)
export function DeleteAccount(name: string) {
  localStorage.removeItem(Pad(name));
}
