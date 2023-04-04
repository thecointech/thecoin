import React from "react";
import ReactDOM from "react-dom";
import { RouterProvider, createHashRouter } from "react-router-dom";
// import ErrorPage from './routes/ErrorPage';
import { LanguageProvider } from '@thecointech/shared/containers/LanguageProvider';
import translations from "@thecointech/shared/translations";
import { Provider } from 'react-redux';
import { appRoutes } from './app';
import { initialize } from './init';
const router = createHashRouter(appRoutes);

const store = initialize()
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <LanguageProvider languages={translations}>
      <RouterProvider router={router} />
    </LanguageProvider>
  </Provider>,
  // </React.StrictMode>
  document.getElementById("root")!
);
