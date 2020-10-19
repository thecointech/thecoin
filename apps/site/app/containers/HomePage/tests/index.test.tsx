/**
 * Test the HomePage
 */

import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { HomePage } from '../index';
import { MemoryRouter } from 'react-router';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn((selector) => selector({
    accounts: {
      map: {},
      active: undefined,
    }
  })),
}));

function loadLocaleData(locale: string) {
  switch (locale) {
    case 'fr':
      return import('compiled-lang/fr.json')
    default:
      return import('compiled-lang/en.json')
  }
}

describe('<HomePage />', () => {
  it('should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(
      // tslint:disable-next-line: jsx-wrap-multiline
      <IntlProvider locale="en">
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </IntlProvider>,
    );
    expect(firstChild).toMatchSnapshot();
  });
});
