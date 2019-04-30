// //import { ImmerReducer, createReducerFunction } from 'immer-reducer';
// import { Wallet } from 'ethers';
// import { IActions } from './types';

// import injectReducer from '../../utils/injectReducer';
// import { TheCoinReducer, GetNamedReducer, buildNamedDictionaryReducer } from '../../utils/immerReducer'
// import { AccountStore, DefaultAccount, ACCOUNTS_KEY, AccountMap } from '../Account/types';
// import * as sync from '../Account/storageSync';


// class UploadReducer extends TheCoinReducer<AccountStore>
//   implements IActions {

//   uploadNewAccount(name: string, wallet: Wallet) {
//     sync.StoreSingleWallet(name, wallet);
//     let account = this.state.accounts.get(name) || {
//       ...DefaultAccount,
//       name
//     }
//     account.wallet = wallet;
//     // NOTE: Immer does not (yet) support map/set
//     let newAccounts = new AccountMap(this.state.accounts);
//     newAccounts.set(name, account);
//     this.draftState.accounts = newAccounts;
//   }
// }


// function buildReducer<T>() {
  
//   // Our upload is a randomly generated entry in the dictionary
//   GetNamedReducer(UploadReducer, "__upload5207eaa8", DefaultAccount, ACCOUNTS_KEY);

//   const withReducer = injectReducer<T>({
//     key: ACCOUNTS_KEY,
//     reducer: buildNamedDictionaryReducer(ACCOUNTS_KEY, sync.ReadAllAccounts())
//   });

//   return withReducer
// }


// export { UploadReducer, buildReducer }

