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
import 'sanitize.css/sanitize.css';

// Import Language Provider
import { LanguageProvider, Languages } from '@thecointech/redux-intl';
import { translations } from './translations';
import { Page } from './Page';

// Create redux store with history
import { configureStore } from '@thecointech/redux';
const store = configureStore();

const MOUNT_NODE = document.getElementById('app') as HTMLElement;
const root = createRoot(MOUNT_NODE);

const render = (languages: Languages) => {
  root.render(
    <Provider store={store}>
      <LanguageProvider languages={languages}>
        <Page />
      </LanguageProvider>
    </Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;
if (module.hot) {
  module.hot.accept(['./Page'], () => {
    render(translations);
  });
}

render(translations);
