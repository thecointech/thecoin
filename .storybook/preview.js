import React from 'react';
import { MemoryRouter } from 'react-router';
import { withTranslations } from './intl';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators = [
  (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
  ),
  withTranslations,
];
