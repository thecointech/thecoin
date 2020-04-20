import { Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';
import { CurrencyCodes } from '@the-coin/utilities'
import { TheSigner, AnySigner } from '../../SignerIdent'
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
  counterPartyAddress: string;
}

// An account state holds all relevant info
// for an account, including loaded transactions etc
export type AccountState = {
   // The accounts name as specified by the user
  name: string;
  // A normalized version of the accounts address
  address: string;
  // Possibly encrypted raw ethers wallet
  signer: AnySigner;
  // Contract connected to this wallet as a signer
  contract: Contract | null;
  // The timestamp of the last update to balance/history
  lastUpdate: Date;
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

export const DefaultAccountValues = {
  contract: null,
  lastUpdate: new Date(0),
  balance: -1,
  history: [],
  displayCurrency: CurrencyCodes.CAD
};

export type AccountPageProps = {
  account: AccountState;
  actions: IActions;
}

/* --- ACTIONS --- */
export interface IActions extends ImmerReducer<AccountState> {

  setName(name: string): void;
  setSigner(signer: TheSigner): Iterator<any>;

  // Get the balance of the account in Coin
  updateBalance(newBalance?: number): Iterator<any>;
  updateHistory(from: Date, until: Date): Generator<CallEffect | PutEffect<{ type: any; payload: any; }>, void, Transaction[]>;

  decrypt(password: string, callback: DecryptCallback | undefined): Iterator<any>;
}

