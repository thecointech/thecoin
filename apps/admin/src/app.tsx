import { createRoot } from "react-dom/client";
import { Provider } from '@thecointech/redux';
import { LanguageProvider } from '@thecointech/redux-intl';
import { translations } from './translations';
import { initialize } from './init';
import { routes } from './containers/App/Routes';
import { RouterProvider, createHashRouter } from 'react-router';

const MOUNT_NODE = document.getElementById('app') as HTMLElement;
const root = createRoot(MOUNT_NODE);
const store = await initialize()
root.render(
  <Provider store={store}>
    <LanguageProvider languages={translations}>
      <RouterProvider router={
        createHashRouter(routes)
      } />
    </LanguageProvider>
  </Provider>,
);
