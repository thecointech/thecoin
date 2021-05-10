import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { App } from './containers/App';
import { configureAdminStore, history } from './reducers';

// Import Language Provider
import { LanguageProvider } from '@thecointech/shared/containers/LanguageProvider';
import "core-js/stable";
import "regenerator-runtime/runtime";
import 'semantic-ui-css/semantic.min.css'

import {Initialize} from './init';
Initialize();

// Import i18n messages
import { translations } from './translations';

const store = configureAdminStore();
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
