/**
 * Combine all reducers in this file and export the combined reducers.
 */

 import { combineReducers, Reducer, ReducersMapObject } from 'redux';
 import { configureStore } from '@thecointech/shared/store';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  return combineReducers({
    ...injectedReducers,
  });
}

export const configureLandingStore = () => configureStore(createReducer);
