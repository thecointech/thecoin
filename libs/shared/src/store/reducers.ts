/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers, Reducer, ReducersMapObject } from 'redux';

/**
 * Merges the main reducer with dynamically injected reducers
 */
export function createReducer(injectedReducers?: ReducersMapObject) : Reducer {
  const rootReducer = combineReducers({
    ...injectedReducers,
  });

  return rootReducer;
}
