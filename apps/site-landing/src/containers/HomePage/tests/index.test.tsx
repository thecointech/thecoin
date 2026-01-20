/**
 * Test the HomePage
 */

import React from 'react';
import { jest } from '@jest/globals';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { HomePage } from '../index';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(() => ({})),
  // useSelector: jest.fn(selector => selector({
  //   accounts: {
  //     map: {},
  //     active: undefined,
  //   }
  // })),
}));

describe('<HomePage />', () => {
  it('should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(
      // tslint:disable-next-line: jsx-wrap-multiline
      <IntlProvider locale="en">
        <MemoryRouter>
          <HelmetProvider>
            <HomePage />
          </HelmetProvider>
        </MemoryRouter>
      </IntlProvider>,
    );
    expect(firstChild).toMatchSnapshot();
  });
});
