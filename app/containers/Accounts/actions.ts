import { createReducerFunction, createActionCreators, isActionFrom } from 'immer-reducer';
import { Dispatch, bindActionCreators, compose } from 'redux';
import { initialState, AccountsReducer } from './reducer';
import { IActions, ContainerState } from './types';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { actions as AccountActions, AccountReducer } from './Account/reducer'
import { rootSaga } from './Account/actions';
import { Wallet } from 'ethers';

// Map Disptach to your DispatchProps
export type DispatchProps = IActions;
export function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(actions, dispatch) as any) as IActions;
}

const actions = createActionCreators(AccountsReducer);
const reducer = createReducerFunction(AccountsReducer, initialState);
const accountReducer = createReducerFunction(AccountReducer);

// This class also has an override to listen for decrypted accounts
// on the Account reducer.  This ensures that when an account
function combinedAccountsReducer(state, action): ContainerState {
  let newState = state;
  if (isActionFrom(action, AccountActions)) {
    // we pass through active account to the accountReducer
    const newActions = {
      ...action,
      args: true
    }
    const activeAccount = accountReducer(state.activeAccount, newActions);
    newState = {
      ...state,
      activeAccount,
    }
    if (action.type == AccountActions.updateWithDecrypted.type) {
      const newAction = {
        type: actions.setSingleAccount.type,
        payload: [activeAccount.name, activeAccount.wallet] as [string, Wallet],
        args: true
      };
      newState = reducer(newState, newAction);
    }
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
    saga: rootSaga
  });

  return compose(
    withReducer,
    withSaga,
  )

  return withReducer
}
  
