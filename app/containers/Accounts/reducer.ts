import { ImmerReducer, createActionCreators } from 'immer-reducer';
import { Wallet } from 'ethers';
import { ContainerState, IActions, DecryptCallback } from './types';
import * as sync from './reducerToLS';
import { call, put } from 'redux-saga/effects'

// The initial state of the App
export const initialState: ContainerState = sync.ReadAllAccounts();

export class AccountsReducer extends ImmerReducer<ContainerState>
  implements IActions {
  setState(newState: ContainerState) {
    sync.StoreAllAccounts(newState);
    this.draftState.accounts = newState.accounts;
  }

  setSingleAccount(name: string, account: Wallet) {
    sync.StoreSingleAccount(name, account);
    this.draftState.accounts.set(name, account);
  }

  setActiveAccount(name: string) {
    const activeAccount = this.state.accounts.get(name);
    // Only decrypted accounts may become active accounts.
    this.draftState.activeAccount = (activeAccount && activeAccount.privateKey) ?
      activeAccount :
      null;
  }

  getActiveAccount() {
    return this.state.activeAccount;
  }

  deleteAccount(name: string) {
    sync.DeleteAccount(name);
    this.draftState.accounts.delete(name);
  }

  // The below is a saga function
  *decryptAccount(name: string, password: string, callback: DecryptCallback | undefined) {
    const account = this.state.accounts.get(name);
    if (account === undefined) {
      throw (`Could not decrypt ${name} because it is not in local storage`);
    }
    if (account.privateKey) {
      console.error(`Attempting decryption of already-decrypted account: ${name}`);
      return;
    }

    try {
      const cb = !callback ?
        undefined :
        (per: number) => {
          const percent = Math.floor(per * 100);
          if (!callback(percent)) {
            throw ("Operation cancelled");
          }
        }
      const wallet = yield call(Wallet.fromEncryptedJson, JSON.stringify(account), password, cb);
      // Ensure callback is called with 100% result so caller knows we are done
      console.log("Account decrypted successfully");
      if (callback) {
        callback(1);
      }
      yield put({
        type: actions.setSingleAccount.type,
        payload: [name, wallet]
      });
    }
    catch (error) {
      console.error(error);
      if (callback)
        callback(-1);
    }
  }
}

export const actions = createActionCreators(AccountsReducer);


// export function buildReducer<T>() {
//   const withReducer = injectReducer<T>({
//     key: 'accounts',
//     reducer: AccountsReducer,
//     initialState,
//   });
//   return withReducer(
//     injectSaga<T>({
//       key: 'accounts',
//       saga: rootSaga
//     })
//   );
// }
