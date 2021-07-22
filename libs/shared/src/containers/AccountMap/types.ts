import { AccountState, AccountMap} from '@thecointech/account';
import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';

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
  addAccount(name: string, address: string, signer: Signer, store?: boolean, setActive?: boolean, unlocked?: Wallet): void;

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void;
};
