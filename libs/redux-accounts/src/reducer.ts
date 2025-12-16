import { AccountMapState, IAccountStoreAPI, initialState } from "./types";
import { AccountState, buildNewAccount } from "@thecointech/account";
import { deleteAccount, storeAccount } from "@thecointech/account/store";
import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { isLocal } from "@thecointech/signers";
import { BaseReducer } from "@thecointech/redux/immerReducer";
import { mappedReducer, splitAccountFromRest } from "./mappedReducer";
import { useSelector } from 'react-redux';
import { activeAccountSelector, selectAccountArray } from './selectors';
import { log } from '@thecointech/logging';
import type { Signer } from 'ethers';
import type { ReducersMapObject } from "redux";

export class AccountMap extends BaseReducer<IAccountStoreAPI, AccountMapState>('accounts', initialState) implements IAccountStoreAPI {

  // Additional Selectors
  static useActive = () => useSelector(activeAccountSelector);
  static useAsArray = () => useSelector(selectAccountArray);

  setActiveAccount(address: string | null) {
    if (address) {
      if (!IsValidAddress(address))
        throw new Error("Cannot set activeAccount: Invalid Address: " + address);
      address = NormalizeAddress(address);
      if (this.state.map[address] === undefined)
        throw new Error(`Cannot set activeAccount: ${address} does not exist`);
    }
    log.trace({address}, 'Set active to {address}');
    this.draftState.active = address
  }

  // Add a new account
  addAccount(name: string, address: string, signer: Signer) {
    // Create the account with default values
    const newAccount = buildNewAccount(name, address, signer);
    log.trace({address: newAccount.address}, 'Adding account: {address}');
    // push to storage
    storeAccount(newAccount);
    // Now for live storage
    this.draftState = {
      map: {
        ...this.state.map,
        [newAccount.address]: newAccount,
      } as any, // Requires use of any as the draftState automatically marks all members as mutable
      active: newAccount.address,
    };
  }

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void {
    const address = NormalizeAddress(account.address);
    log.trace({address}, 'Removing account from localStorage: {address}');
    const { signer } = account;
    // We don't want active account with an invalid value
    const active = this.state.active == address
      ? null
      : this.state.active;

    // delete the account from our map
    this.draftState = {
      active,
      map: Object.entries(this.state.map)
        .reduce((m, entry) => {
          if (entry[0] != account.address) {
            return {
              ...m,
              [entry[0]]: entry[1]
            }
          }
          return m;
        }, {})
    }
    // Finally, remove from the website entirely.
    deleteAccount(account);
    // For good measure, we clear the data in the JS object.
    if (isLocal(signer)) {
      delete (signer as any).privateKey;
    }
  }
}

// This should be called by createReducers to manually create the accounts reducers.
// Our accountMapReducer is a little different than most, as it cannot be injected.
// This is because it shares it's state tree with the account reducers
export function buildAccountStoreReducer(injectedReducers?: ReducersMapObject) {
  const { accounts, rest } = splitAccountFromRest(injectedReducers);
  const accountMapReducer = AccountMap._reducer;
  const accountStoreReducer = mappedReducer(accountMapReducer, accounts);
  return { accountStoreReducer, rest };
}
