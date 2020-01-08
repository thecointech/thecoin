/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import history from '@the-coin/shared/utils/history';
import { createRootReducer } from '@the-coin/shared/containers/Account/reducer';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    router: connectRouter(history),
    accounts: createRootReducer(),
    ...injectedReducers,
  });

  // Wrap the root reducer and return a new root reducer with router state
  //const mergeWithRouterState = connectRouter(history);
  //return mergeWithRouterState(rootReducer);
  return rootReducer;
}
