import React from 'react';
import { jest } from '@jest/globals';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@thecointech/redux';
import { LanguageProvider } from '@thecointech/redux-intl';

// Mock redux hooks
jest.unstable_mockModule('redux-injectors', () => ({
  useInjectSaga: jest.fn(),
  useInjectReducer: jest.fn(),
}));

const { App } = await import('../index');

describe('<App />', () => {
  it('should render and match the snapshot', () => {
    // Create a minimal Redux store for testing
    const store = configureStore();

    // Create a data router with a single route for testing
    const router = createMemoryRouter([
      {
        path: '/',
        element: <App />,
        children: [
          {
            index: true,
            element: <div>Test Route</div>,
          },
        ],
      },
    ]);

    const { container } = render(
      <Provider store={store}>
        <LanguageProvider languages={{ en: {}, fr: {} }}>
          <RouterProvider router={router} />
        </LanguageProvider>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });
});
