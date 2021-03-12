import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { bindActionCreators } from "redux";
import { Wallet } from "ethers";
import { useDispatch } from "react-redux";
import { IsValidAddress, NormalizeAddress } from "@the-coin/utilities";
import { ACCOUNTMAP_KEY, initialState, AccountMapState, IAccountMapActions } from "./types";
import { TheCoinReducer, GetNamedReducer, buildNamedDictionaryReducer } from "../../store/immerReducer";
import { AccountState, DefaultAccountValues } from "../Account/types";
import { storeAccount, deleteAccount } from "../../utils/storageSync";
import { AnySigner, isSigner, isWallet } from "../../SignerIdent";
import { composeReducers } from "immer-reducer";
import { selectAccounts } from "./selectors";
import { takeLatest } from "redux-saga/effects";
import { buildSaga } from "../../store/sagas";
import { getAccountReducer } from "../Account/reducer";

export class AccountMap extends TheCoinReducer<AccountMapState> implements IAccountMapActions {

  setActiveAccount(address: string|null) {
    if (address) {
      if (!IsValidAddress(address))
        throw new Error("Invalid Address: " + address);
      address = NormalizeAddress(address);
    }

    this.draftState.active = address
  }

  // Add a new account, optionally store in LocalStorate, in unlocked state
  *addAccount(name: string, signer: AnySigner, store: boolean, unlocked?: Wallet) {
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

    // Store the value
    this.draftState.map[address] = newAccount

    // If we have an unlocked account or an external signer,
    // immediately initialize the account.
    // (after the account has been pushed to storage)
    // This job is delegated to the account reducer to allow
    // it to complete several other important initalization tasks
    if (unlocked || isSigner(signer)) {
      const toSet = unlocked ?? signer;
      const accountReducer = getAccountReducer(toSet.address)
      yield this.sendValues(accountReducer.actions.setSigner, [toSet]);
    }

  }

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void {
    const {signer, address} = account;
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

const { actions, reducer, reducerClass } = GetNamedReducer(AccountMap, ACCOUNTMAP_KEY, initialState);
const dictionaryReducer = buildNamedDictionaryReducer(ACCOUNTMAP_KEY, "map", initialState)
const combined = composeReducers(reducer, dictionaryReducer);

function* rootSaga() {
  yield takeLatest(actions.addAccount.type, buildSaga<AccountMap>(reducerClass, selectAccounts, "addAccount"));
}

export const useAccountMapStore = () => {
  useInjectReducer({ key: ACCOUNTMAP_KEY, reducer: combined });
  useInjectSaga({ key: ACCOUNTMAP_KEY, saga: rootSaga});
}

export const useAccountMapApi = () =>
  (bindActionCreators(actions, useDispatch()) as unknown) as IAccountMapActions;

