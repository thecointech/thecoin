import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/shared/store';
import { ApplicationBaseState } from '@thecointech/shared/types';
import { combineReducers, ReducersMapObject } from 'redux';
import { buildAccountStoreReducer, AccountMapState, AccountMap } from '@thecointech/shared/containers/AccountMap';
import { LanguageProviderReducer } from '@thecointech/shared/containers/LanguageProvider/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';
import { getAllAccounts, getInitialAddress } from '@thecointech/account/store';

export function withStore(initialState?: Partial<ApplicationBaseState>) {
  const createReducer = (injectedReducers?: ReducersMapObject) =>
    injectedReducers
      ? combineReducers({...injectedReducers})
      : (state: ApplicationBaseState) => state ?? initialState;
  const store = configureStore(createReducer, initialState as any);
  return (Story: React.ElementType) => <Provider store={store}><Story /></Provider>
}

export function withAccounts(initialState?: AccountMapState) {
  // If no accounts passed, default to dev accounts
  AccountMap.initialize(initialState ?? {
    active: getInitialAddress(),
    map: getAllAccounts(),
  })
  const createReducer = (injectedReducers?: ReducersMapObject) => {
    const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers);
    return combineReducers({
      accounts: accountStoreReducer,
      ...rest,
    });
  }
  const store = configureStore(createReducer);
  return (Story: React.ElementType) => <Provider store={store}><Story /></Provider>
}

// Simple decorators that are used in a few places
export const withLanguageProvider = (Story: React.ElementType) => {
  LanguageProviderReducer.useStore();
  return <Story />
}

export const withMediaContext = (Story: React.ElementType) =>
  <MediaContextProvider>
    <style>{mediaStyles}</style>
    <Story />
  </MediaContextProvider>
