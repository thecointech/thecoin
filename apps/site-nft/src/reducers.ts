/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers, Reducer, ReducersMapObject } from 'redux';
import { connectRouter } from 'connected-react-router';
import { configureStore, history } from '@thecointech/shared/store';
import { buildAccountStoreReducer, AccountMapState } from '@thecointech/shared/containers/AccountMap';
import { readAllAccounts } from '@thecointech/shared/utils/storageSync';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers, initialAccounts());
  return combineReducers({
    router: connectRouter(history) as Reducer,
    accounts: accountStoreReducer,
    ...rest,
  });
}

function initialAccounts(): AccountMapState {

  if (process.env.NODE_ENV === 'development') {
    const { getDevWallets } = require('@thecointech/accounts');
    return getDevWallets();
  }
  return {
    active: null,
    map: readAllAccounts()
  }
}

export { history };
export const configureAppStore = () => configureStore(createReducer);
