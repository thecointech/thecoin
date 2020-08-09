import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import {createReducer} from './reducers';
import { App } from './containers/App';
import { configureAppStore } from '@the-coin/shared/configureStore';
import history from '@the-coin/shared/utils/history';
import { RbcStore } from './RbcApi/store';
import { ConfigStore } from '@the-coin/store';

// Import Language Provider
import LanguageProvider from './containers/LanguageProvider';
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

RbcStore.initialize({adapter: "leveldb"});
ConfigStore.initialize({adapter: "leveldb"});

const store = configureAppStore(createReducer, undefined, history);

const MOUNT_NODE = document.getElementById('root') as HTMLElement;

ReactDOM.render(
  <Provider store={store}>
    <LanguageProvider locale="en" messages={translationMessages}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </LanguageProvider>
  </Provider>,
  MOUNT_NODE
);
