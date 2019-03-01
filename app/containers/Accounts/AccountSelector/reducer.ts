import { ImmerReducer, isActionFrom, createReducerFunction } from 'immer-reducer';
import { ContainerState, IActions } from './types';
import { actions as AccountActions, AccountReducer } from '../Account/reducer'
import { ContainerState as Account } from '../Account/types'
import { Wallet } from 'ethers';
import { GetConnected } from '@the-coin/utilities/lib/TheContract';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { buildSagas } from '../Account/actions';
import { compose } from 'redux';
import { selectActiveAccount } from './selectors';
import { CurrencyCodes } from '@the-coin/utilities/lib/CurrencyCodes';

// The initial state of the App
const initialState: ContainerState = {
  accounts: new Map<string, Account>(),
  activeAccount: null
}

class AccountSelectorReducer extends ImmerReducer<ContainerState>
  implements IActions {

  setActiveAccount(name: string, wallet: Wallet) {
    const { activeAccount } = this.state;
    if (activeAccount) {
      // If the name is the same, no need to update.
      if (name == activeAccount.name) {
        return;
      }
      // Remember the current account
      this.draftState.accounts.set(activeAccount.name, activeAccount);
    }
    let account = this.state.accounts.get(name);
    if (!account) {
      account = {
        name,
        wallet,
        contract: GetConnected(wallet),
        lastUpdate: 0,
        balance: 0,
        history: [],
        displayCurrency: CurrencyCodes.CAD // For now assume we are canadian
      };
      this.draftState.accounts.set(name, account);
    }
    this.draftState.activeAccount = account;
  }
}
const reducer = createReducerFunction(AccountSelectorReducer, initialState);
const accountReducer = createReducerFunction(AccountReducer);


// This class also has an override to listen for decrypted accounts
// on the Account reducer.  This ensures that when an account
function combinedAccountsReducer(state, action): ContainerState {
  let newState = state;
  if (isActionFrom(action, AccountActions)) {
    // we manually pass through active account to the accountReducer
    const newActions = {
      ...action,
      args: true
    }

    const activeAccount = accountReducer(state.activeAccount, newActions);
    newState = {
      ...state,
      activeAccount,
    }
    // if (action.type == AccountActions.updateWithDecrypted.type) {
    //   const newAction = {
    //     type: actions.setSingleAccount.type,
    //     payload: [activeAccount.name, activeAccount.wallet] as [string, Wallet],
    //     args: true
    //   };
    //   newState = reducer(newState, newAction);
    // }
  }
  else {
    newState = reducer(newState, action);
  }
  return newState;
}

export function buildReducer<T>() {
  const withReducer = injectReducer<T>({
    key: 'accounts',
    reducer: combinedAccountsReducer,
    initialState,
  });

  const withSaga = injectSaga<T>({
    key: 'accounts',
    saga: buildSagas(selectActiveAccount)
  });

  return compose(
    withReducer,
    withSaga,
  )

  return withReducer
}

export { AccountSelectorReducer, initialState }

