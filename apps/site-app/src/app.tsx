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

// Load the favicon and the .htaccess file
import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import 'file-loader?name=.htaccess!./.htaccess';

import { configureAppStore, history } from '@thecointech/shared/store';
import { translations } from './translations';

import { initTracking } from './utils/reactga';
initTracking();
import { init } from '@thecointech/logging';
init('site-app')

// Create redux store with history
const store = configureAppStore(undefined);
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
    // tslint:disable-next-line:max-line-length
    const refresh = require('./containers/App').default; // https://github.com/webpack/webpack-dev-server/issues/100
    render(translations, refresh);
  });
}

render(translations);

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install();
}
