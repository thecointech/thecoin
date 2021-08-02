import { ImmerReducer } from 'immer-reducer';
import { DateTime } from 'luxon';
import { SagaIterator } from 'redux-saga';
import { AccountState, AccountDetails } from '@thecointech/account';
import { Signer } from '@ethersproject/abstract-signer';

export type { AccountState };

/* --- CALLBACKS ---*/
export type DecryptCallback = (percent: number) => boolean;


export type AccountPageProps = {
  account: AccountState;
  actions: IActions;
}

/* --- ACTIONS --- */
export interface IActions extends ImmerReducer<AccountState> {

  setName(name: string): void;
  setSigner(signer: Signer): SagaIterator;

  // create contract, connect to services, load details
  connect(): SagaIterator;

  // Save/load private details
  loadDetails(): SagaIterator;
  setDetails(newDetails: Partial<AccountDetails>): SagaIterator;

  // Get the balance of the account in Coin
  updateBalance(newBalance?: number): SagaIterator;
  updateHistory(from: DateTime, until: DateTime): SagaIterator;

  decrypt(password: string, callback: DecryptCallback | undefined): SagaIterator;
}

