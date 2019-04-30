// //import { ImmerReducer, createReducerFunction } from 'immer-reducer';
// import { Wallet } from 'ethers';
// import { IActions } from './types';

// import injectReducer from '@the-coin/components/utils/injectReducer';
// import { TheCoinReducer, GetNamedReducer } from '@the-coin/components/utils/immerReducer'
// import { ApplicationRootState } from 'types';
// import { AccountMap, DefaultAccount } from '@the-coin/components/containers/Account/types';
// import * as sync from '@the-coin/components/containers/Account/storageSync';

// // The initial state of the App
// const initialState: AccountMap = sync.ReadAllAccounts();

// const CONTENT_KEY : keyof ApplicationRootState = "accounts";


// class AccountsReducer extends TheCoinReducer<AccountMap>
//   implements IActions {

//   setState(newState: AccountMap) {
//     sync.StoreAllAccounts(newState);
//     this.draftState.clear();
//     newState.forEach((account, name) => this.draftState.set(name, account));
//   }
 
//   setSingleWallet(name: string, wallet: Wallet) {
//     sync.StoreSingleWallet(name, wallet);
//     let account = this.state.get(name) || {
//       ...DefaultAccount,
//       name
//     }
//     account.wallet = wallet;
//     this.draftState.set(name, account);
//   }
  
//   deleteWallet(name: string) {
//     sync.DeleteWallet(name);
//     this.draftState.delete(name);
//   }
// }

// const { reducer, actions } = GetNamedReducer(AccountsReducer, CONTENT_KEY, initialState);

// function buildReducer<T>() {
//   const withReducer = injectReducer<T>({
//     key: CONTENT_KEY,
//     reducer: reducer
//   });

//   return withReducer
// }
  
// export { AccountsReducer, buildReducer, actions }

