/**
 * Combine all reducers in this file and export the combined reducers.
 */

 import { combineReducers, Reducer, ReducersMapObject } from 'redux';
 import { connectRouter } from 'connected-react-router';
 import { configureStore, history } from '@thecointech/shared/store';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  return combineReducers({
    router: connectRouter(history) as Reducer,
    ...injectedReducers,
  });
}

export { history };
export const configureLandingStore = () => configureStore(createReducer);
