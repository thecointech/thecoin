/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

if (window.location.pathname === "/gauth") {
  const newUrl = `/#${window.location.pathname}${window.location.search}`;
  window.location.replace(newUrl);
}

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// Import all the third party stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import 'sanitize.css/sanitize.css';

// Import root app
import { App } from 'containers/App';

// Import Language Provider
import { LanguageProvider, Languages } from '@thecointech/shared/containers/LanguageProvider';

import { configureAppStore, history } from './reducers';
import { translations } from './translations';

// Create redux store with history
const store = configureAppStore();
const MOUNT_NODE = document.getElementById('app') as HTMLElement;

const render = (languages: Languages, Component = App) => {
  ReactDOM.render(
    // tslint:disable-next-line:jsx-wrap-multiline
    <Provider store={store}>
      <LanguageProvider languages={languages}>
        <ConnectedRouter history={history}>
          <Component />
        </ConnectedRouter>
      </LanguageProvider>
    </Provider>,
    MOUNT_NODE,
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;
if (module.hot) {
  module.hot.accept(['./i18n', './containers/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    import('./containers/App').then(({ App }) => render(translations, App));
  });
}

render(translations);
