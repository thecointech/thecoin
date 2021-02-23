import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { App } from './containers/App';
import { configureAppStore, history } from '@the-coin/shared/store';

// Import Language Provider
import { LanguageProvider } from '@the-coin/shared/containers/LanguageProvider';
import "core-js/stable";
import "regenerator-runtime/runtime";
//import './app.global.css';
import 'semantic-ui-css/semantic.min.css'

import {Initialize} from './init';
Initialize();

// Import i18n messages
import { translations } from './translations';

const store = configureAppStore(undefined);
const MOUNT_NODE = document.getElementById('root') as HTMLElement;

ReactDOM.render(
  <Provider store={store}>
    <LanguageProvider languages={translations}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </LanguageProvider>
  </Provider>,
  MOUNT_NODE
);
