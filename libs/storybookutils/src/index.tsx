import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/redux';
// import { ApplicationBaseState } from '@thecointech/shared/types';
import { combineReducers, ReducersMapObject } from 'redux';
import { buildAccountStoreReducer, AccountMapState, AccountMap } from '@thecointech/redux-accounts';
import { LanguageProvider, LanguageProviderReducer, Languages } from '@thecointech/redux-intl';
import { MediaContextProvider, mediaStyles } from '@thecointech/media-context';
import { getAllAccounts, getInitialAddress } from '@thecointech/account/store';

const accounts = await getAllAccounts();

type StorybookBaseState = {}

export function withStore<T extends StorybookBaseState>(initialState?: Partial<T>) {
  const createReducer = (injectedReducers?: ReducersMapObject) =>
    injectedReducers
      ? combineReducers({...injectedReducers})
      : (state: StorybookBaseState) => state ?? initialState;
  const store = configureStore(createReducer, initialState as any);
  return (StoryFn: React.ElementType) => <Provider store={store}><StoryFn /></Provider>
}

export function withAccounts(initialState?: AccountMapState) {
  // If no accounts passed, default to dev accounts
  AccountMap.initialize(initialState ?? {
    active: getInitialAddress(),
    map: accounts,
  })
  const createReducer = (injectedReducers?: ReducersMapObject) => {
    const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers);
    return combineReducers({
      accounts: accountStoreReducer,
      ...rest,
    });
  }
  const store = configureStore(createReducer);
  return (StoryFn: React.ElementType) => <Provider store={store}><StoryFn /></Provider>
}

// Generic reducer decorator
export function withReducer(reducer: { useStore: () => any }) {
  return (StoryFn: React.ElementType) => {
    reducer.useStore();
    return <StoryFn />
  }
}

// Dedicated LP decorator is used in a few places
export const withLanguageProvider = (languages: Languages) => {
  return (StoryFn: React.ElementType) => {
    LanguageProviderReducer.useStore();
    return (
      <LanguageProvider languages={languages}>
        <StoryFn />
      </LanguageProvider>
    );
  };
};

export const withMediaContext = (StoryFn: React.ElementType) =>
  <MediaContextProvider>
    <style>{mediaStyles}</style>
    <StoryFn />
  </MediaContextProvider>
