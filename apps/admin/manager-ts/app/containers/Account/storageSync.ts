import { Wallet } from 'ethers';

const PREFIX = 'lcl_wal_';
//const PREFIX_LEN = PREFIX.length;
// function Strip(name: string | null): string {
// 	if (name != null && name.startsWith(PREFIX)) {
// 		return name.substring(PREFIX_LEN);
// 	}
// 	return '';
// }
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
