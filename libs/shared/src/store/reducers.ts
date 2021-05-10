/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers, Reducer, ReducersMapObject } from 'redux';
import { connectRouter } from 'connected-react-router';

import { history } from './history';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
export function createReducer(injectedReducers?: ReducersMapObject) : Reducer {
  const rootReducer = combineReducers({
    router: connectRouter(history) as Reducer,
    ...injectedReducers,
  });

  return rootReducer;
}
