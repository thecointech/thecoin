import { Wallet } from 'ethers';
import { AccountMap, DefaultAccount } from './types';

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
export function GetStored(name: string): Wallet | null {
  const storedItem = localStorage.getItem(Pad(name));
  if (storedItem !== null) {
    const wallet = JSON.parse(storedItem) as Wallet;
    // Ensure valid wallet by checking address
    if (wallet.address) return wallet;
  }
  return null;
}

export function SetStored(name: string, account: Wallet) {
  localStorage[Pad(name)] = JSON.stringify(account);
}

function AddressMatches(addr1: string, addr2: string) {
  // ignore inconsequential differ
  return addr1.slice(-40).toLowerCase() === addr2.slice(-40).toLowerCase();
}
//
//  Store a single account, assumes this account has not yet
//  been decrypted
export function StoreSingleWallet(name: string, wallet: Wallet) {
  // Check it's ok to store this wallet.  This is all checked UI-side already, should
  // we allow overwrites here?
  const storedItem = GetStored(name);
  if (storedItem != null) {
    // Are we overwriting an existing wallet?
    if (!AddressMatches(storedItem.address, wallet.address)) {
      throw "Unable to store named wallet: It's name clashes with existing wallet";
    }
    // The account being stored already matches what is stored here.
    return true;
  }

  // Do not store decrypted account
  if (wallet.privateKey) {
    throw 'Attempting to store a decrypted account';
  }
  SetStored(name, wallet);
  return true;
}

// Utility function for fetching all stored accounts
export function ReadAllAccounts() : AccountMap {
  const allAccounts = new AccountMap();
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const name = Strip(localStorage.key(i));
    const wallet = GetStored(name);

    if (wallet != null) {
      allAccounts[name] = {
        ...DefaultAccount,
        name,
        wallet
      };
    }
  }
  return allAccounts
}

//
//  Replace all existing accounts with ones in this list.
export function StoreAllAccounts(accounts: AccountMap) {
  // First, delete any extra accounts that are not stored
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const key = localStorage.key(i);
    if (key != null && key.startsWith(PREFIX)) {
      const name = Strip(key);
      if (!(name in accounts)) {
      }
    }
  }
  Object.entries(accounts).forEach(([name, account]) => {
	  if (account.wallet)
		  StoreSingleWallet(name, account.wallet);
  });
}

//
// Delete the named account from localstorage (not tested)
export function DeleteWallet(name: string) {
  localStorage.removeItem(Pad(name));
}
