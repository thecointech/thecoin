/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */
// Import all the third party stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'sanitize.css/sanitize.css';

// Import root app
import { Page } from './Page';

// Import Language Provider
import { LanguageProvider, Languages } from '@thecointech/shared/containers/LanguageProvider';
import { translations } from './translations';

// Create redux store with history
import {configureLandingStore } from './reducers';
const store = configureLandingStore();

const MOUNT_NODE = document.getElementById('app') as HTMLElement;
const render = (languages: Languages, Component = Page) => {
  ReactDOM.render(
    // tslint:disable-next-line:jsx-wrap-multiline
    <Provider store={store}>
    <LanguageProvider languages={languages}>
      <Component />
    </LanguageProvider>,
    </Provider>,
    MOUNT_NODE,
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;
if (module.hot) {
  module.hot.accept(['./Page'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    // tslint:disable-next-line:max-line-length
    const refresh = require('./Page').default; // https://github.com/webpack/webpack-dev-server/issues/100
    render(translations, refresh);
  });
}

render(translations);
