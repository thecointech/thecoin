import { ImmerReducer } from 'immer-reducer';
import { CurrencyCode } from '@thecointech/utilities/CurrencyCodes'
import { TheSigner, AnySigner } from '../../SignerIdent'
import { Transaction } from '@thecointech/tx-blockchain';
import { AccountDetails } from '../AccountDetails';
import { IDX } from '@ceramicstudio/idx';
import { DateTime } from 'luxon';
import { SagaIterator } from 'redux-saga';
import { TheCoin } from '@thecointech/contract';

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
  contract: TheCoin | null;
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
  historyStart?: DateTime;
  historyStartBlock?: number;
  historyEnd?: DateTime;
  historyEndBlock?: number;
};

export const DefaultAccountValues = {
  contract: null,
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
  setSigner(signer: TheSigner): SagaIterator;

  // create contract, connect to services, load details
  connect(): SagaIterator;

  // Save/load private details
  loadDetails(): SagaIterator;
  setDetails(newDetails: AccountDetails):SagaIterator;

  // Get the balance of the account in Coin
  updateBalance(newBalance?: number):SagaIterator;
  updateHistory(from: DateTime, until: DateTime): SagaIterator;

  decrypt(password: string, callback: DecryptCallback | undefined):SagaIterator;
}

