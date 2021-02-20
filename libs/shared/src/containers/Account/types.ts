import { Contract } from 'ethers';
import { ImmerReducer } from 'immer-reducer';
import { CurrencyCode } from '@the-coin/utilities/CurrencyCodes'
import { TheSigner, AnySigner } from '../../SignerIdent'
import { PutEffect, CallEffect } from 'redux-saga/effects';
import { Transaction } from '@the-coin/tx-blockchain';
import { AccountDetails } from '../AccountDetails';
import { IDX } from '@ceramicstudio/idx';

/* --- CALLBACKS ---*/
export type DecryptCallback = (percent: number) => boolean;

// An account state holds all relevant info
// for an account, including loaded transactions etc
export type AccountState = {
   // The accounts name as specified by the user
  name: string;
  // A normalized version of the accounts address
  address: string;
  // Possibly encrypted raw ethers wallet or metamask account
  signer: AnySigner;
  // Contract connected to this wallet as a signer
  contract: Contract | null;
  // The timestamp of the last update to balance/history
  lastUpdate: Date;
  // Current balance in Coin
  balance: number;
  // Transaction history
  history: Transaction[];


  // IDX vars
  idx?: IDX;
  // Are we saving/loading something from IDX?
  idxIO?: boolean;

  // Private details
  details: AccountDetails;
  // Public profile (?)

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

  details: {
    displayCurrency: CurrencyCode.CAD,
  }
};

export type AccountPageProps = {
  account: AccountState;
  actions: IActions;
}

/* --- ACTIONS --- */
export interface IActions extends ImmerReducer<AccountState> {

  setName(name: string): void;
  setSigner(signer: TheSigner): Iterator<object>;

  // Save/load private details
  loadDetails(): Iterator<object>;
  setDetails(newDetails: AccountDetails): Iterator<object>;

  // Get the balance of the account in Coin
  updateBalance(newBalance?: number): Iterator<object>;
  updateHistory(from: Date, until: Date): Generator<object>;

  decrypt(password: string, callback: DecryptCallback | undefined): Iterator<object>;
}

