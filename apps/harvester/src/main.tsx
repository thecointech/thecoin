import ReactDOM from "react-dom";
// import { RouterProvider, createHashRouter } from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router';
// import ErrorPage from './routes/ErrorPage';
import { LanguageProvider } from '@thecointech/shared/containers/LanguageProvider';
import translations from "@thecointech/shared/translations";
import { history } from '@thecointech/shared/store';
import { Provider } from 'react-redux';
import { App } from './app';
import { initialize } from './init';

// const router = createHashRouter(appRoutes);

const store = await initialize()
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <LanguageProvider languages={translations}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </LanguageProvider>
  </Provider>,
  // </React.StrictMode>
  document.getElementById("root")!
);
