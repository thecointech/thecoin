import React from 'react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import createReducer from '../apps/site-landing/src/reducers';

const store = configureAppStore(createReducer, undefined, history);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </Provider>
  ),
];
