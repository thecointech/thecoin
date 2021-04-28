import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/shared/store';
import { ApplicationBaseState } from '@thecointech/shared/types';
import { combineReducers, ReducersMapObject } from 'redux';
import { buildAccountStoreReducer, AccountMapState } from '@thecointech/shared/containers/AccountMap';

export function withStore(initialState?: ApplicationBaseState) {
  const createReducer = (injectedReducers?: ReducersMapObject) =>
    injectedReducers
      ? combineReducers({...injectedReducers})
      : (state: ApplicationBaseState) => state ?? initialState;
  const store = configureStore(createReducer, initialState);
  return (Story: React.ElementType) => <Provider store={store}><Story /></Provider>
}

export function withAccounts(initialState: AccountMapState) {
  const createReducer = (injectedReducers?: ReducersMapObject) => {
    const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers, initialState);
    return combineReducers({
      accounts: accountStoreReducer,
      ...rest,
    });
  }
  const store = configureStore(createReducer);
  return (Story: React.ElementType) => <Provider store={store}><Story /></Provider>
}
