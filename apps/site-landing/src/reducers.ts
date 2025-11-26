/**
 * Combine all reducers in this file and export the combined reducers.
 */

 import { combineReducers, Reducer, ReducersMapObject } from 'redux';
 import { configureStore } from '@thecointech/shared/store';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  // combineReducers requires at least one reducer, so we provide a dummy one
  const rootReducer = (state = {}) => state;

  return combineReducers({
    root: rootReducer,
    ...injectedReducers,
  });
}

export const configureLandingStore = () => configureStore(createReducer);
