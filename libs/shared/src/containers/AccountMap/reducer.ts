import { AnyAction, bindActionCreators, Reducer, ReducersMapObject } from "redux";
import { AccountMap, AccountMapState, IAccountStoreAPI, initialState } from "./types";
import { AccountState, DefaultAccountValues } from "../Account";
import { deleteAccount, readAllAccounts, storeAccount } from "../../utils/storageSync";
import { IsValidAddress, NormalizeAddress } from "@thecointech/utilities";
import { AnySigner, isWallet } from "../../SignerIdent";
import { Wallet } from 'ethers';
import { TheCoinReducer } from "../../store/immerReducer";
import { createActionCreators, createReducerFunction } from "immer-reducer";
import { useDispatch } from "react-redux";

export class AccountMapReducer extends TheCoinReducer<AccountMapState> implements IAccountStoreAPI {

  // Initialize accounts.  This is moved into the store itself (instead
  // of as part of initialState) to allow the app to specifically initialize
  // accounts (eg - dev testing accounts etc)
  initializeAccounts(map?: AccountMap) {
    // Check for re-initialization

    // NOTE: Devtools can trigger re-firing the same action repeatedly
    // if (Object.keys(this.state.map).length > 0)
    //   return;

    // if (process.env.NODE_ENV !== 'production') {
    //   if (Object.keys(this.state.map).length > 0)
    //     throw new Error('Cannot re-initialize existing store');
    // }
    const newMap = map ?? readAllAccounts();
    this.draftState = {
      map: newMap,
      active: Object.keys(newMap)[0] ?? null
    }
  };

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
    const address = NormalizeAddress(signer.address);
    const newAccount: AccountState = {
      ...DefaultAccountValues,
      name,
      address,
      signer,
    }
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
      [address]: newAccount,
    }
    if (setActive)
      this.draftState.active = address;
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

// const getReducer = (initial?: AccountMapState) => GetNamedReducer(AccountMap, ACCOUNTMAP_KEY, initial ?? initialState);
// const buildCombined = (initial?: AccountMapState) => {
//   const { reducer } = getReducer(initial);
//   const dictionaryReducer = buildNamedDictionaryReducer(ACCOUNTMAP_KEY, "map", initialState)
//   return composeReducers(reducer, dictionaryReducer);
// }

//let combined: Reducer|undefined = undefined;
// export const useAccountMapState = (initial?: ActiveAccountState) => {

const accountMapReducer = createReducerFunction(AccountMapReducer, initialState) as unknown as Reducer;
const actions = createActionCreators(AccountMapReducer);

// export const accountMapApi = (dispatch: Dispatch) =>
//   bindActionCreators(getReducer().actions, dispatch) as IAccountStoreAPI;
// export const useAccountMapApi = () =>
//   accountMapApi( useDispatch());
//   useInjectReducer({ key: ACCOUNTMAP_KEY, reducer });

//   // const combined = React.useRef(undefined as Reducer|undefined);
//   // if (!combined.current) {
//   //   console.log("Building reducer with: " + JSON.stringify(initial));
//   //   combined.current = buildCombined(initial);
//   // }
//   //useInjectReducer({ key: ACCOUNTMAP_KEY, reducer: combined.current });
//   // We also need to start saga's for any account that becomes activated.
//   //const accounts = useAccounts();
//   // Because of the rules around hooks, we have
//   // to start a saga (even if no account is selected)
//   //useAccount(accounts?.active);
// }

// export const useAccountMapApi = () => {
//   const actions = createActionCreators(AccountMap);
//   //const { reducer, actions } = GetNamedReducer(LanguageProviderReducer, LANGUAGE_KEY, initialState);
//   //useInjectReducer({ key: LANGUAGE_KEY, reducer });
//   return (bindActionCreators(actions, useDispatch()) as IAccountStoreAPI) as IAccountStoreAPI;
// };

// const emptyReducer = (state: any) => {
//   return state ?? {};
// }

const mappedReducer = (accountReducers: ReducersMapObject) => {
  const accountKeys = Object.keys(accountReducers);

  // Reducer is almost identical to combineReducer, but does not
  // do invalid key checking (which is not applicable to us)
  const combinedReducer = (prevMap: AccountMap, action: AnyAction) => {
    const nextMap: AccountMap = {
      ...prevMap,
    };
    let changed = false;
    for (let i = 0; i < accountKeys.length; i++) {
      const key = accountKeys[i];
      const prevState = prevMap[key];
      const nextState = accountReducers[key](prevState, action);
      nextMap[key] = nextState;
      changed = changed || (nextState != prevState);
    }
    return changed ? nextMap : prevMap;
  }

  // Cross-slicing reducer function. Allows both AccountMap reducer
  // and actual accounts to operate on the data in accounts.map
  return (state: AccountMapState, action: AnyAction) => {

    // First, run on account map
    const nextState = accountMapReducer(state, action);
    if (nextState != state)
      return nextState;

    // next, run on each account reducer in turn
    const nextMap = combinedReducer(state.map, action);
    return (nextMap == state.map)
      ? state
      : {
        ...state,
        map: nextMap,
      }

    // const map = accountMap(state.map, action);
    // return (map == state.map)
    //   ? state
    //   : {
    //       ...state,
    //       map,
    //     }
  }
}

function splitAccountFromRest(injectedReducers?: ReducersMapObject) {
  let rest: ReducersMapObject = {};
  const accounts: ReducersMapObject = {};
  if (injectedReducers) {
    Object.entries(injectedReducers)
      .forEach(([key, value]) => (IsValidAddress(key) ? accounts : rest)[key] = value);
  }
  return { accounts, rest };
}


export function buildAccountStoreReducer(injectedReducers?: ReducersMapObject) {
  const { accounts, rest } = splitAccountFromRest(injectedReducers);
  const accountStoreReducer = mappedReducer(accounts);
  return { accountStoreReducer, rest };
}

export const useAccountStoreApi = () =>
  bindActionCreators(actions, useDispatch()) as IAccountStoreAPI;;
