import { Wallet, Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';
import { Dictionary } from "lodash";
import { CurrencyCodes } from '@the-coin/utilities/CurrencyCodes'
import { ApplicationBaseState } from '../../types';
import { TheSigner } from '../../SignerIdent'
import { PutEffect, CallEffect } from 'redux-saga/effects';

/* --- CALLBACKS ---*/
export type DecryptCallback = (percent: number) => boolean;

/* --- STATE --- */
export type Transaction = {
	txHash?: string;
	date: Date;
	change: number;
	logEntry: string;
	balance: number;
}

// An account state holds all relevant info
// for an account, including loaded transactions etc
export type AccountState = {
	name: string; // Convenience storage of name
	// Possibly encrypted raw ethers wallet
	signer: TheSigner | Wallet | null;
	// Contract connected to this wallet as a signer
	contract: Contract | null;
	// The timestamp of the last update to balance/history
	lastUpdate: number;
	// Current balance in Coin
	balance: number;
	// Transaction history
	history: Transaction[];
	// The currency to display your account value in
	displayCurrency: CurrencyCodes;

	// cache values to remember the date range we
	// have stored, and corresponding block numbers
	historyLoading?: boolean;
	historyStart?: Date;
	historyStartBlock?: number;
	historyEnd?: Date;
	historyEndBlock?: number;
};

export const DefaultAccount: AccountState = {
	name: "",
	signer: null,
	contract: null,
	lastUpdate: 0,
	balance: -1,
	history: [],
	displayCurrency: CurrencyCodes.CAD
  }

export type AccountMap = Dictionary<AccountState>;

export const ACCOUNTS_KEY: keyof ApplicationBaseState = "accounts";


/* --- ACTIONS --- */
export interface IActions extends ImmerReducer<AccountState> {

	setName(name: string) : void;
	setSigner(name: string, signer: TheSigner): Iterator<any>;

	// Get the balance of the account in Coin
	updateBalance(newBalance?: number) : Iterator<any>;
	updateHistory(from: Date, until: Date) : Generator<CallEffect | PutEffect<{ type: any; payload: any; }>, void, Transaction[]>;

	decrypt(password: string, callback: DecryptCallback | undefined): Iterator<any>;
}
/* --- EXPORTS --- */

export interface AccountPageProps {
  account: AccountState;
  actions: IActions;
}
