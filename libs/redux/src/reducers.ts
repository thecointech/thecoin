/**
 * Combine all reducers in this file and export the combined reducers.
 */
import { combineReducers, Reducer, type ReducersMapObject } from 'redux';

/**
* Merges the static reducers with the dynamically injected reducers
*/
export function getCreateReducer(staticReducers?: ReducersMapObject) {
  return function createReducer(injectedReducers?: ReducersMapObject): Reducer {
    return combineReducers({
      ...(
        staticReducers ?? {
          // combineReducers requires at least one reducer, so we provide a dummy one
          root: (state = {}) => state,
        }
      ),
      ...injectedReducers,
    });
  }
}

