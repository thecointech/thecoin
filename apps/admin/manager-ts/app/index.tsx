import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
//import 'react-dates/initialize';

import { App } from './containers/App';
import { configureStore } from './store/configureStore';
import history from '@the-coin/components/utils/history';

// Import Language Provider
import LanguageProvider from 'containers/LanguageProvider';
// Import i18n messages
//import { translationMessages } from './translations/index.js';
const translationMessages = {
  "en": {
  }
}

import "core-js/stable";
import "regenerator-runtime/runtime";
//import './app.global.css';
import 'semantic-ui-css/semantic.min.css'

// We do some hackery with the path.fix to allow
import {pathFix} from './utils/pathFix';
pathFix();

// We do some hackery with the path.fix to allow
import {signIn} from './utils/Firebase';
signIn();

const initialState = {};
const store = configureStore(initialState, history);

const MOUNT_NODE = document.getElementById('root') as HTMLElement;

ReactDOM.render(
  <Provider store={store}>
    <LanguageProvider messages={translationMessages}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </LanguageProvider>
  </Provider>,
  MOUNT_NODE
);
