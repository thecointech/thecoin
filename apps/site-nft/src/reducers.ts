/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers, Reducer, ReducersMapObject } from 'redux';
import { configureStore } from '@thecointech/redux';
import { buildAccountStoreReducer } from '@thecointech/redux-accounts';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers);
  return combineReducers({
    accounts: accountStoreReducer,
    ...rest,
  });
}

export const configureAppStore = () => configureStore(createReducer);
