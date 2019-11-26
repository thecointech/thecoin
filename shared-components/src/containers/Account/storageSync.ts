import { Wallet } from 'ethers';
import { AccountMap, DefaultAccount } from './types';
import { TheSigner, SignerIdent } from '../../SignerIdent';

// NOTE: These prefixes must be all equal length
enum Prefix {
  SIGNER = 'lcl_sgn_',
  WALLET = 'lcl_wal_', 
}

function Strip(name: string): string {
  return (name.startsWith(Prefix.WALLET) || name.startsWith(Prefix.SIGNER)) ? 
    name.substring(Prefix.WALLET.length) :
    ''
}

const Pad = (name: string, prefix: Prefix) => prefix + name;
const PadWallet = (name: string): string => Pad(name, Prefix.WALLET);
const PadSigner = (name: string): string => Pad(name, Prefix.SIGNER);
const ThrowIfNotValid = (data: any) => { if (data.privateKey) throw new Error("Cannot store unencrypted wallet") }

export function AsWallet(signer: TheSigner|null) {
  const asWallet = signer as any;
  if (asWallet && (asWallet["x-ethers"] || asWallet.privateKey))
    return asWallet;
  return null;
}

// Read stored signer/wallet from memory
function GetStoredData<T extends SignerIdent>(name: string, prefix: Prefix) : T|null {
  const storedItem = localStorage.getItem(Pad(name, prefix));
  if (storedItem !== null)
  {
    const r = JSON.parse(storedItem) as T
    if (r.address)
      return r;
  }
  return null;
}
export const GetStoredWallet = (name: string) => GetStoredData<Wallet>(name, Prefix.WALLET);
export const GetStoredSigner = (name: string) => GetStoredData<TheSigner>(name, Prefix.SIGNER);
export const GetStored = (name: string) => GetStoredWallet(name) || GetStoredSigner(name)

export function StoreWallet(name: string, wallet: Wallet) {
  ThrowIfNotValid(wallet)
  localStorage[PadWallet(name)] = JSON.stringify(wallet);
}
export function StoreSigner(name: string, signer: TheSigner) {
  ThrowIfNotValid(signer)
  // We can't directly save a signer (it has a circular reference)
  // but also it's data isn't particularily useful.
  const saveData = {
    address: signer.address,
    isSigner: true
  }
  localStorage[PadSigner(name)] = JSON.stringify(saveData)
}

//
//  Store a single account, assumes this account has not yet
//  been decrypted
// export function StoreSingle<T extends SignerIdent>(name: string, signer: T, prefix:Prefix) {
//   // Check it's ok to store this wallet.  This is all checked UI-side already, should
//   // we allow overwrites here?
//   const storedItem = GetStored(name);
//   if (storedItem != null) {
//     // Are we overwriting an existing wallet?
//     if (!AddressMatches(storedItem.address, signer.address)) {
//       throw "Unable to store named wallet: It's name clashes with existing wallet";
//     }
//     // The account being stored already matches what is stored here.
//     return true;
//   }

//   ThrowIfNotValid(signer)
//   localStorage[Pad(name, prefix)] = JSON.stringify(signer);

//   return true;
// }
// export const Store = (name: string, signer: TheSigner) =>
//   StoreSingle(name, signer, (AsWallet(signer) ? Prefix.WALLET : Prefix.SIGNER))


// Utility function for fetching all stored accounts
export function ReadAllAccounts() : AccountMap {
  const allAccounts = new AccountMap();
  for (let i = 0; i <= localStorage.length - 1; i++) {
    const raw = localStorage.key(i);
    if (!raw)
      continue;

    const name = Strip(raw);
    const walletOrSigner = GetStored(name);
    if (walletOrSigner != null) {
      allAccounts[name] = {
        ...DefaultAccount,
        name,
        signer: walletOrSigner
      };
    }
  }
  return allAccounts
}

// //
// //  Replace all existing accounts with ones in this list.
// export function StoreAllAccounts(accounts: AccountMap) {
//   // First, delete any extra accounts that are not stored
//   for (let i = 0; i <= localStorage.length - 1; i++) {
//     const key = localStorage.key(i);
//     if (key != null && key.startsWith(Prefix.WALLET) || ) {
//       const name = Strip(key);
//       if (!(name in accounts)) {
//       }
//     }
//   }
//   Object.entries(accounts).forEach(([name, account]) => {
//     const wallet = AsWallet(account.signer);
// 	  if (wallet)
// 		  StoreSingleWallet(name, wallet);
//   });
// }

//
// Delete the named account from localstorage (not tested)
export function DeleteWallet(name: string) {
  localStorage.removeItem(PadWallet(name));
}
