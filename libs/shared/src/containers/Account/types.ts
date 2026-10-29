import { ImmerReducer } from 'immer-reducer';
import { DateTime } from 'luxon';
import { AccountState } from '@thecointech/account';
import type { UserPreferences } from '@thecointech/account-details';
import { Signer } from 'ethers';
import type { SagaIterator } from '@redux-saga/core';

export type { AccountState };

/* --- CALLBACKS ---*/
export type DecryptCallback = (percent: number) => boolean;


export type AccountPageProps = {
  account: AccountState;
  actions: IActions;
}

/* --- ACTIONS --- */
export interface IActions extends ImmerReducer<AccountState> {

  setName(name: string): SagaIterator;
  setSigner(signer: Signer): SagaIterator;

  // create contract, connect to services, load details
  connect(): SagaIterator;

  // Load details (basic & preferences), save preferences
  loadDetails(): SagaIterator;
  setPreferences(newPreferences: Partial<UserPreferences>): SagaIterator;

  // KYC management
  initKycProcess(): SagaIterator; // Called to start process
  checkKycStatus(forceVerify?: boolean): SagaIterator; // Automatically polled

  // Get the balance of the account in Coin
  updateBalance(newBalance?: number): SagaIterator;
  updateHistory(from: DateTime, until: DateTime): SagaIterator;

  decrypt(password: string, callback: DecryptCallback | undefined): SagaIterator;
}

