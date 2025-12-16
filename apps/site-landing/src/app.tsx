/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Import all the third party stuff
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import 'sanitize.css/sanitize.css';

// Import Language Provider
import { LanguageProvider, Languages } from '@thecointech/redux-intl';
import { configureStore } from '@thecointech/redux';
import { routes } from './containers/App/Routes';
import { createHashRouter } from 'react-router';

// Import i18n messages
import { translations } from './translations';
import { initTracking } from './utils/reactga';
initTracking();

// Allow Preview docs on testing site.
import { injectPrismicPreviewScript } from './components/Prismic/inject';
if (process.env.CONFIG_NAME === 'prodtest') {
  injectPrismicPreviewScript();
}

// Create redux store with history
const store = configureStore();
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
