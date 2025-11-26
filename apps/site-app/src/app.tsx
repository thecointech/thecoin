/**
 * app.tsx
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

if (window.location.pathname === "/gauth") {
  const newUrl = `/#${window.location.pathname}${window.location.search}`;
  window.location.replace(newUrl);
}

// Import all the third party stuff
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import 'sanitize.css/sanitize.css';

// Import Language Provider
import { LanguageProvider, Languages } from '@thecointech/shared/containers/LanguageProvider';

import { configureAppStore } from './reducers';
import { routes } from './containers/App/Routes';
import { translations } from './translations';
import { createHashRouter } from 'react-router';

// Create redux store with history
const store = configureAppStore();
const MOUNT_NODE = document.getElementById('app') as HTMLElement;
const root = createRoot(MOUNT_NODE);

const render = (languages: Languages) => {
  root.render(
    <Provider store={store}>
      <LanguageProvider languages={languages}>
        <RouterProvider router={
          createHashRouter(routes)
        } />
      </LanguageProvider>
    </Provider>
  );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;
if (module.hot) {
  module.hot.accept(['./containers/App'], () => {
    render(translations);
  });
}

render(translations);
