import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/shared/store';
import { ApplicationBaseState } from '@thecointech/shared/types';
import { combineReducers, ReducersMapObject } from 'redux';
import { buildAccountStoreReducer, AccountMapState } from '@thecointech/shared/containers/AccountMap';
import { useLanguageProvider } from '@thecointech/shared/containers/LanguageProvider/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';

export function withStore(initialState?: Partial<ApplicationBaseState>) {
  const createReducer = (injectedReducers?: ReducersMapObject) =>
    injectedReducers
      ? combineReducers({...injectedReducers})
      : (state: ApplicationBaseState) => state ?? initialState;
  const store = configureStore(createReducer, initialState as any);
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

// Simple decorators that are used in a few places
export const withLanguageProvider = (Story: React.ElementType) => {
  useLanguageProvider();
  return <Story />
}

export const withMediaContext = (Story: React.ElementType) =>
  <MediaContextProvider>
    <style>{mediaStyles}</style>
    <Story />
  </MediaContextProvider>
