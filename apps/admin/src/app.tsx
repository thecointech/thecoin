import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
// Import Language Provider
import { LanguageProvider } from '@thecointech/shared/containers/LanguageProvider';
import { history } from '@thecointech/shared/store';
import { translations } from './translations';
import { initialize } from './init';
import { App } from './containers/App';

const store = await initialize()
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
