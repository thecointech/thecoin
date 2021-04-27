import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/shared/store';
import { combineReducers, ReducersMapObject } from 'redux';
import { buildAccountStoreReducer, AccountMapState } from '@thecointech/shared/containers/AccountMap';

export const withStore = () => {

  const createReducer = (injectedReducers?: ReducersMapObject) => combineReducers({...injectedReducers});
  const store = configureStore(createReducer);
  return (Story: React.ElementType) => <Provider store={store}><Story /></Provider>
}

export const withAccounts = (initialState: AccountMapState) => {
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
