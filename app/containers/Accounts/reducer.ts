import { ImmerReducer } from 'immer-reducer';
import { Wallet } from 'ethers';
import { ContainerState, IActions } from './types';
import * as sync from './reducerToLS';
import { GetConnected } from '@the-coin/utilities/lib/TheContract';

// The initial state of the App
const initialState: ContainerState = sync.ReadAllAccounts();

class AccountsReducer extends ImmerReducer<ContainerState>
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
    const wallet = this.state.accounts.get(name);
    if (wallet) {
      // Only update active account if nothing has changed.
      if (!this.state.activeAccount || 
        this.state.activeAccount.wallet.privateKey != wallet.privateKey)      
      {
        this.draftState.activeAccount = {
          name: name,
          wallet: wallet,
          contract: GetConnected(wallet)!,
          balance: 0,
          history: []
        };
      }
    }
    else {
      this.draftState.activeAccount = null;
    }
  }

  deleteAccount(name: string) {
    sync.DeleteAccount(name);
    this.draftState.accounts.delete(name);
  }
}

export { AccountsReducer, initialState }

