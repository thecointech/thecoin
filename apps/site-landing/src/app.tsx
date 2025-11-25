/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

// Import all the third party stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'sanitize.css/sanitize.css';

// Import root app
import { App } from 'containers/App';

// Import Language Provider
import { LanguageProvider, Languages } from '@thecointech/shared/containers/LanguageProvider';

import { configureLandingStore } from './reducers';

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
const store = configureLandingStore();
const MOUNT_NODE = document.getElementById('app') as HTMLElement;

const render = (languages: Languages, Component = App) => {
  ReactDOM.render(
    // tslint:disable-next-line:jsx-wrap-multiline
    <Provider store={store}>
      <LanguageProvider languages={languages}>
        <Component />
      </LanguageProvider>
    </Provider>,
    MOUNT_NODE,
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;
if (module.hot) {
  module.hot.accept(['./containers/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    // tslint:disable-next-line:max-line-length
    const refresh = require('./containers/App').default; // https://github.com/webpack/webpack-dev-server/issues/100
    render(translations, refresh);
  });
}

render(translations);
