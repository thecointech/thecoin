import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { App } from './containers/App';
// Import Language Provider
import { LanguageProvider } from '@thecointech/shared/containers/LanguageProvider';
import { configureAdminStore, history } from './reducers';
import { translations } from './translations';

// initialize logging first
import { log } from '@thecointech/logging';
log.info(`Loading App: ${__VERSION__} - ${process.env.CONFIG_NAME}`);

// Create redux store with history
const store = configureAdminStore();

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider languages={translations}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </LanguageProvider>
    </Provider>,
    document.getElementById('react-app')
  );
}

render();
