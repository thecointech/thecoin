import React from 'react';
import { Provider } from 'react-redux'
import 'semantic-ui-css/semantic.css'
import './index.css'
import { configureStore } from '@thecointech/shared/store';
import { createHashRouter } from 'react-router';
import { routes } from './Routes';
import { RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';

const MOUNT_NODE = document.getElementById('app') as HTMLElement;
const root = createRoot(MOUNT_NODE);

const store = configureStore();
root.render(
  <Provider store={store}>
    <RouterProvider router={
      createHashRouter(routes)
    } />
  </Provider>,
)
