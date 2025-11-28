/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers, Reducer, ReducersMapObject } from 'redux';
import { configureStore } from '@thecointech/shared/store';
import { buildAccountStoreReducer } from '@thecointech/shared/containers/AccountMap';


/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
 function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  // TODO: add the appropriate accounts from .env accounts
  const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers);
  return combineReducers({
    accounts: accountStoreReducer,
    ...rest,
  });
}

export const configureAdminStore = () => configureStore(createReducer);
