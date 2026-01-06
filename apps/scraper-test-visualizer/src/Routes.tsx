import React from 'react';
import { HomePage } from './containers/HomePage';
import { TestViewerPage } from './containers/TestViewerPage';
import App from './Home/App';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'test/:key/:element', element: <TestViewerPage /> },
    ]
  }
]
