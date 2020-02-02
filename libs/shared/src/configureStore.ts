/**
 * Create the store with dynamic reducers
 */

//import { configureStore, getDefaultMiddleware, StoreEnhancer } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';
import { createInjectorsEnhancer } from '@the-coin/redux-injectors';
import createSagaMiddleware from 'redux-saga';
import { ApplicationBaseState } from './types';
import { History } from 'history';
import { createStore, compose, applyMiddleware } from 'redux';

//declare var module: any;
declare var window: any;

export function configureAppStore(createReducer: () => any, initialState: ApplicationBaseState | {} = {}, history: History<any>) {
  const reduxSagaMonitorOptions = {};

  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [sagaMiddleware, routerMiddleware(history)];

  const enhancers = [
    applyMiddleware(...middlewares),
    createInjectorsEnhancer({
      createReducer,
      runSaga,
    }),
  ];
  const doCompose = getCompose();

  const store = createStore(
    createReducer(),
    initialState,
    doCompose(...enhancers)
   )

  // const store = configureStore({
  //   reducer: createReducer(),
  //   preloadedState: initialState,
  //   middleware: [...getDefaultMiddleware(), ...middlewares],
  //   enhancers,
  // });

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  // if (module.hot) {
  //   module.hot.accept('./reducers', () => {
  //     forceReducerReload(store);
  //   });
  // }

  return store;
}

function getCompose()
{
  let composeEnhancers = compose;

  // If Redux Dev Tools and Saga Dev Tools Extensions are installed, enable them
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    /* eslint-disable no-underscore-dangle */
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});

    // NOTE: Uncomment the code below to restore support for Redux Saga
    // Dev Tools once it supports redux-saga version 1.x.x
    // if (window.__SAGA_MONITOR_EXTENSION__)
    //   reduxSagaMonitorOptions = {
    //     sagaMonitor: window.__SAGA_MONITOR_EXTENSION__,
    //   };
    /* eslint-enable */
  }

  return composeEnhancers;
}