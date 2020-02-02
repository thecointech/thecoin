import { useInjectReducer } from "@the-coin/redux-injectors";
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

class AccountMap extends TheCoinReducer<AccountMapState> implements IAccountMapActions {

  setActiveAccount(address?: string) {
    if (address) {
      if (!IsValidAddress(address))
        throw new Error("Invalid Address: " + address);
      if (NormalizeAddress(address) !== address) {
        debugger;
        address = NormalizeAddress(address);
      }
    } 
      
    this.draftState.active = address
  }

  // Add a new account, optionally store in LocalStorate, in unlocked state
  addAccount(name: string, signer: AnySigner, store: boolean, unlocked?: Wallet) {

    // Store the account in our live list
    const newAccount: AccountState = {
      ...DefaultAccountValues,
      name,
      address: NormalizeAddress(signer.address),
      signer: unlocked ?? signer,
    }
    const {address} = signer;
    this.draftState.map[address] = newAccount

    if (store) {
      storeAccount(newAccount);
    }
  }

  // Remove the given account from list & storage
  deleteAccount(account: AccountState): void {
    const {signer, address} = account;
    // We don't want active account with an invalid value
    if (this.state.active == address) {
      this.draftState.active = undefined;
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

