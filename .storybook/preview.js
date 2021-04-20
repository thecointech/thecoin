import React from 'react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import {configureAppStore} from '@thecointech/shared/build/store';
import { withTranslations } from './intl';

const store = configureAppStore(undefined);

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
  withTranslations,
];
