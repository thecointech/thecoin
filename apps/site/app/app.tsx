/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

if (window.location.pathname === "/accounts/gauth") {
  debugger;
  const newUrl = `/#${window.location.pathname}${window.location.search}`;
  window.location.replace(newUrl)
}

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// Import all the third party stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
//import FontFaceObserver from 'fontfaceobserver';
import history from '@the-coin/shared/utils/history';
import 'sanitize.css/sanitize.css';

// Import root app
import { App } from 'containers/App';

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';

// Load the favicon and the .htaccess file
import '!file-loader?name=[name].[ext]!./images/favicon.ico';
import 'file-loader?name=.htaccess!./.htaccess';

import {configureAppStore} from '@the-coin/shared/configureStore';
import createReducer from './reducers';

// Import i18n messages
import { translationMessages } from './i18n';

import { initTracking } from './utils/reactga';
initTracking();

// TODO: We are temporarily removing the web-fonts
// as we seem to be throwing exceptions in their
// loading.  We need to investigate this methods usefulness
// before deciding whether or not to ditch entirely though.

// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
//const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
// openSansObserver.load().then(() => {
//   document.body.classList.add('fontLoaded');
// });

// Create redux store with history
const initialState = undefined;
const store = configureAppStore(createReducer, initialState, history);
const MOUNT_NODE = document.getElementById('app') as HTMLElement;

const render = (messages: any, Component = App) => {
  ReactDOM.render(
    // tslint:disable-next-line:jsx-wrap-multiline
    <Provider store={store}>
      <LanguageProvider messages={messages}>
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
    render(translationMessages, refresh);
  });
}
// Chunked polyfill for browsers without Intl support
// if (!window.Intl) {
//   new Promise(resolve => {
//     resolve(import('intl'));
//   })
//     .then(() =>
//       Promise.all([
//         import('intl/locale-data/jsonp/en.js'),
//         import('intl/locale-data/jsonp/de.js'),
//       ]),
//     )
//     .then(() => render(translationMessages))
//     .catch(err => {
//       throw err;
//     });
// } else {
//   render(translationMessages);
// }
// TODO: Polyfill via https://polyfill.io/v3/url-builder/ 
render(translationMessages);

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install();
}
