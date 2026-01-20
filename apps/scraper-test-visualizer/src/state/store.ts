import { configureStore } from '@thecointech/redux';
import { combineReducers } from 'redux';
import type { InitialState } from './initialState';

// Define the root state type
export interface RootState {
  tests?: InitialState;
}

// Create root reducer
export function createReducer(injectedReducers = {}) {
  return combineReducers({
    ...injectedReducers,
  });
}

// Configure and export the store
export const store = configureStore(createReducer);
