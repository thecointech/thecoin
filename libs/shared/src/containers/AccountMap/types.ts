import { AccountState } from '../Account/types'
import { Dictionary } from 'lodash';
import { Wallet } from 'ethers';
import { ApplicationBaseState } from '../../types';
import { readAllAccounts } from '../../utils/storageSync';
import { AnySigner } from '../../SignerIdent';


export const ACCOUNTMAP_KEY: keyof ApplicationBaseState = "accounts";

export type AccountDict = Dictionary<AccountState>;

export const initialState = {
  map: readAllAccounts(),
  active: null as string | null,
};

export type AccountMapState = Readonly<typeof initialState>;

////////////////////////////////////////////

export interface IAccountMapActions {
  // Set the account we are currently interacting with
  setActiveAccount(account: string|null): void;

  // Add a new account, optionally store in LocalStorate, in unlocked state
  addAccount(name: string, signer: AnySigner, store: boolean, unlocked?: Wallet): void;

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void;
};
