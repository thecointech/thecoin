import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import { Wallet } from 'ethers';
import { ContainerState, IActions } from './types';
import * as sync from './reducerToLS';
import injectReducer from 'utils/injectReducer';

// The initial state of the App
const initialState: ContainerState = sync.ReadAllAccounts();

class AccountsReducer extends ImmerReducer<ContainerState>
  implements IActions {

  setState(newState: ContainerState) {
    sync.StoreAllAccounts(newState);
    this.draftState.wallets = newState.wallets;
  }
 
  setSingleWallet(name: string, wallet: Wallet) {
    sync.StoreSingleWallet(name, wallet);
    this.draftState.wallets.set(name, wallet);
  }
  
  deleteWallet(name: string) {
    sync.DeleteWallet(name);
    this.draftState.wallets.delete(name);
  }
}

const reducer = createReducerFunction(AccountsReducer, initialState);

function buildReducer<T>() {
  const withReducer = injectReducer<T>({
    key: 'wallets',
    reducer: reducer,
    initialState,
  });

  return withReducer
}
  
export { AccountsReducer, buildReducer }

