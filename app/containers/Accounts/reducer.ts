import { ImmerReducer } from 'immer-reducer';
import { Wallet } from 'ethers';
import injectReducer from 'utils/injectReducer';
import { ContainerState, IActions } from './types';
import * as sync from './reducerToLS';

// The initial state of the App
export const initialState: ContainerState = sync.ReadAllAccounts();

export class AccountsReducer extends ImmerReducer<ContainerState>
  implements IActions {
  setAllAccounts(newState: ContainerState) {
    sync.StoreAllAccounts(newState);
    this.draftState.values = newState.values;
  }

  setSingleAccount(name: string, account: Wallet) {
    sync.StoreSingleAccount(name, account);
    this.draftState.set(name, account);
  }

  deleteAccount(name: string) {
    sync.DeleteAccount(name);
    this.draftState.delete(name);
  }
}

export function buildReducer<T>() {
  return injectReducer<T>({
    key: 'accounts',
    reducer: AccountsReducer,
    initialState,
  });
}
