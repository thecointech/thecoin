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
function GetStored(name: string): Wallet | null {
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

// function LockedAccount(name: string, wallet: Wallet) : AccountType {
//   return {
//     name,
//     wallet,
//     contract: null,
//     lastUpdate: 0,
//     balance: 0,
//     history: [],
//   };
// }
//
// Read all accounts from local storage, return in array
export function ReadAllAccounts(): ContainerState {
  const allAccounts = new Map<string, Wallet>();
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const name = Strip(localStorage.key(i));
    const wallet = GetStored(name);
    if (wallet != null) {
      allAccounts.set(name, wallet);
    }
  }
  return {
    wallets: allAccounts
  };
}

function AddressMatches(addr1: string, addr2: string) {
  // ignore inconsequential differ
  return addr1.slice(-40).toLowerCase() === addr2.slice(-40).toLowerCase();
}
//
//  Store a single account, assumes this account has not yet
//  been decrypted
export function StoreSingleWallet(name: string, account: Wallet) {
  // Check it's ok to store this account.  This is all checked UI-side already, should
  // we allow overwrites here?
  const storedItem = GetStored(name);
  if (storedItem != null) {
    // Are we overwriting an existing account?
    if (!AddressMatches(storedItem.address, account.address)) {
      throw "Unable to store named account: It's name clashes with existing account";
    }
    // The account being stored already matches what is stored here.
    return true;
  }

  // Do not store decrypted account
  if (account.privateKey) {
    throw 'Attempting to store a decrypted account';
  }
  SetStored(name, account);
  return true;
}

//
//  Replace all existing accounts with ones in this list.
export function StoreAllAccounts(state: ContainerState) {
  // First, delete any extra accounts that are not stored
  const { wallets } = state;
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const key = localStorage.key(i);
    if (key != null && key.startsWith(PREFIX)) {
      const name = Strip(key);
      if (!(name in wallets)) {
      }
    }
  }
  wallets.forEach((wallet, name) => {
    StoreSingleWallet(name, wallet);
  });
}

//
// Delete the named account from localstorage (not tested)
export function DeleteWallet(name: string) {
  localStorage.removeItem(Pad(name));
}
