import { bindActionCreators, Reducer, ReducersMapObject } from "redux";
import { AccountMapState, IAccountStoreAPI, initialState } from "./types";
import { AccountState, DefaultAccountValues } from "../Account";
import { deleteAccount, storeAccount } from "../../utils/storageSync";
import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { AnySigner, isWallet } from "../../SignerIdent";
import { Wallet } from 'ethers';
import { TheCoinReducer } from "../../store/immerReducer";
import { createActionCreators, createReducerFunction } from "immer-reducer";
import { useDispatch } from "react-redux";
import { mappedReducer, splitAccountFromRest } from "./mappedReducer";

export class AccountMapReducer extends TheCoinReducer<AccountMapState> implements IAccountStoreAPI {

  setActiveAccount(address: string | null) {
    if (address) {
      if (!IsValidAddress(address))
        throw new Error("Cannot set activeAccount: Invalid Address: " + address);
      address = NormalizeAddress(address);
      if (this.state.map[address] === undefined)
        throw new Error(`Cannot set activeAccount: ${address} does not exist`);
    }

    this.draftState.active = address
  }

  // Add a new account, optionally store in LocalStorate, in unlocked state
  addAccount(name: string, signer: AnySigner, store: boolean = true, setActive: boolean = true, unlocked?: Wallet) {
    // Check the signer & unlocked are actually the same account
    if (unlocked && NormalizeAddress(signer.address) != NormalizeAddress(unlocked?.address)) {
      throw new Error("Accounts being stored are mis-matched");
    }
    // Create the account with default values
    const newAccount = buildNewAccount(name, signer);
    // If asked to store, push to storage
    if (store) {
      storeAccount(newAccount);
    }

    // If we have an unlocked account, replace the signer
    // (after the account has been pushed to storage)
    if (unlocked) {
      newAccount.signer = unlocked;
    }
    // Now for live storage
    this.draftState.map = {
      ...this.state.map,
      [newAccount.address]: newAccount,
    }
    if (setActive)
      this.draftState.active = newAccount.address;
  }

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void {
    const address = NormalizeAddress(account.address);
    const { signer } = account;
    // We don't want active account with an invalid value
    if (this.state.active == address) {
      this.draftState.active = null;
    }
    // Remove from the list
    delete this.draftState.map[address];
    // Finally, remove from the website entirely.
    deleteAccount(account);
    // For good measure, we clear the data in the JS object.
    if (isWallet(signer)) {
      delete (signer as any).privateKey;
    }
  }
}

export function buildNewAccount(name: string, signer: AnySigner) : AccountState {
  const address = NormalizeAddress(signer.address);
  return {
    ...DefaultAccountValues,
    name,
    address,
    signer,
  }
}

// Our accountMapReducer is a little different than most, as it cannot be injected.
// It is responsible for re-organizing the injected account reducers below
let accountMapReducer = null as Reducer|null; // = createReducerFunction(AccountMapReducer, initialState) as unknown as Reducer;
const actions = createActionCreators(AccountMapReducer);

// Called by createReducers.  Returns a single reducer for all accounts and
// a list of the remaining (non-account) reducers.
export function buildAccountStoreReducer(injectedReducers?: ReducersMapObject) {
  const { accounts, rest } = splitAccountFromRest(injectedReducers);
  const accountStoreReducer = accountMapReducer
    ? mappedReducer(accountMapReducer, accounts)
    : (state: AccountMapState) =>
    {
      return state ?? initialState;
    }
  return { accountStoreReducer, rest };
}

// Slightly-hacky way to support customizable initialState.  This reducer is
// not injected, but we still want the initial creation to be client-controlled
export const useAccountStoreReducer = (initial: () => AccountMapState = () => initialState) => {
  if (!accountMapReducer) {
    console.log("Initializing ASR");
    accountMapReducer = createReducerFunction(AccountMapReducer, initial()) as unknown as Reducer;
  }
}

export const useAccountStoreApi = () =>
  bindActionCreators(actions, useDispatch()) as IAccountStoreAPI;;
