import { ImmerReducer } from 'immer-reducer';
import { Wallet } from 'ethers';
import injectReducer from 'utils/injectReducer';
import { ContainerState, IActions, DecryptCallback } from './types';
import * as sync from './reducerToLS';

// The initial state of the App
export const initialState: ContainerState = sync.ReadAllAccounts();

export class AccountsReducer extends ImmerReducer<ContainerState>
  implements IActions {
  setAllAccounts(newState: ContainerState) {
    sync.StoreAllAccounts(newState);
    this.draftState.accounts = newState.accounts;
  }

  setSingleAccount(name: string, account: Wallet) {
    sync.StoreSingleAccount(name, account);
    this.draftState.accounts.set(name, account);
  }

  deleteAccount(name: string) {
    sync.DeleteAccount(name);
    this.draftState.accounts.delete(name);
  }

  async decryptAccount(name: string, password: string, callback: DecryptCallback | undefined) {
    const account = this.draftState.accounts.get(name);
    if (account === undefined) {
      throw (`Could not decrypt ${name} because it is not in local storage`);
    }

    if (account.privateKey) {
      console.error(`Attempting decryption of already-decrypted account: ${name}`);
    }
    try {
      const cb = !callback ?
        undefined :
        (per: number) => {
          const percent = Math.round(per * 100);
          if (!callback(percent)) {
            throw ("Operation cancelled");
          }
        }
      const wallet = await Wallet.fromEncryptedJson(JSON.stringify(account), password, cb);
      // Ensure callback is called with 100% result so caller knows we are done
      if (callback) {
        callback(1);
      }
      this.draftState.accounts.set(name, wallet);
    }
    catch (error) {
      console.error(error);
      if (callback)
        callback(-1);
    }
  }
}

export function buildReducer<T>() {
  return injectReducer<T>({
    key: 'accounts',
    reducer: AccountsReducer,
    initialState,
  });
}
