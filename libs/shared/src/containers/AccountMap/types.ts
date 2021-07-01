import { AccountState } from '@thecointech/account';
import { AnySigner } from "@thecointech/utilities/SignerIdent";
import { Wallet } from 'ethers';
import { Dictionary } from "lodash";

export type AccountMap = Dictionary<AccountState>;
export type AccountMapState =  {
  active: string|null;
  map: AccountMap;
}

export const initialState: AccountMapState = {
  active: null,
  map: {}
};

export type AccountMapStore = {
  accounts: AccountMapState
}

////////////////////////////////////////////

export interface IAccountStoreAPI {
  // Set the account we are currently interacting with
  setActiveAccount(account: string|null): void;

  // Add a new account, optionally store in LocalStorate, in unlocked state
  addAccount(name: string, signer: AnySigner, store?: boolean, setActive?: boolean, unlocked?: Wallet): void;

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void;
};
