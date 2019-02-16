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

  // setActiveAccount(name: string) {
  //   const wallet = this.state.accounts.get(name);
  //   if (wallet) {
  //     // Only update active account if nothing has changed.
  //     if (!this.state.activeAccount || 
  //       this.state.activeAccount.wallet != wallet.privateKey)      
  //     {
  //       this.draftState.activeAccount = {
  //         name: name,
  //         wallet: wallet,
  //         contract: GetConnected(wallet)!,
  //         lastUpdate: 0,
  //         balance: 0,
  //         history: []
  //       };
  //     }
  //   }
  //   else {
  //     this.draftState.activeAccount = null;
  //   }
  // }

  
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

