import { useInjectReducer } from "redux-injectors";
import { bindActionCreators, Dispatch } from "redux";
import { Wallet } from "ethers";
import { useDispatch } from "react-redux";
import { IsValidAddress, NormalizeAddress } from "@the-coin/utilities";
import { ACCOUNTMAP_KEY, initialState, AccountMapState, IAccountMapActions } from "./types";
import { TheCoinReducer, GetNamedReducer, buildNamedDictionaryReducer } from "../../utils/immerReducer";
import { AccountState, DefaultAccountValues } from "../Account/types";
import { storeAccount, deleteAccount } from "../../utils/storageSync";
import { AnySigner, isWallet } from "../../SignerIdent";
import { composeReducers } from "immer-reducer";

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
  addAccount(name: string, signer: AnySigner, store: boolean, unlocked?: Wallet) {
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
    this.draftState.map[address] = newAccount
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
    delete account.contract;
    delete account.signer;
  }
}

const { reducer, actions } = GetNamedReducer(AccountMap, ACCOUNTMAP_KEY, initialState);
const dictionaryReducer = buildNamedDictionaryReducer(ACCOUNTMAP_KEY, "map", initialState)
const combined = composeReducers(reducer, dictionaryReducer);
export const useAccountMapStore = () => {
  useInjectReducer({ key: ACCOUNTMAP_KEY, reducer: combined });
}

export const accountMapApi = (dispatch: Dispatch) =>
  bindActionCreators(actions, dispatch) as IAccountMapActions;
export const useAccountMapApi = () =>
  accountMapApi( useDispatch());
