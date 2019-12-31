/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import history from '@the-coin/shared/utils/history';
import languageProviderReducer from 'containers/LanguageProvider/reducer';
import { createRootReducer } from '@the-coin/shared/containers/Account/reducer';
import { reducer as activeAccountReducer } from "containers/Accounts/Reducer";

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export default function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    language: languageProviderReducer,
    router: connectRouter(history),
    accounts: createRootReducer(),
    activeAccount: activeAccountReducer,
    ...injectedReducers,
  });

  return rootReducer;
}
