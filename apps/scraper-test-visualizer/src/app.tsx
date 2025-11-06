import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import './index.css'
import App from './Home/App'
import { Initializer } from './state/initializer'
import { configureAppStore } from './store';

const store = configureAppStore();
ReactDOM.render(
  <Provider store={store}>
    <App />
    <Initializer />
  </Provider>,
  document.getElementById('app')!
)
