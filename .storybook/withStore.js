import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/shared/store';
import { combineReducers } from 'redux';
import { buildAccountStoreReducer } from '@thecointech/shared/containers/AccountMap';

// Our reducer
function createReducer(injectedReducers) {
  const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers);
  return combineReducers({
    accounts: accountStoreReducer,
    ...rest,
  });
}

export const withStore = (Story) => {
    const store = configureStore(createReducer);
    return <Provider store={store}><Story /></Provider>
}
