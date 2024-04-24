/**
 * Create the store with dynamic reducers
 */

import { routerMiddleware } from 'connected-react-router';
import { createInjectorsEnhancer } from 'redux-injectors';
import reduxSaga from '@redux-saga/core';
import { history } from './history';
import { createStore, compose, applyMiddleware, ReducersMapObject, Reducer, StoreEnhancer } from 'redux';
import { ApplicationBaseState } from '../types';
export { history };

//@ts-ignore weird-o hack to get jest to run this file with no complaints.
// unfortunately jest resolves the CJS version of this file, and somehow
// ts ends up importing the old icky method, despite esModuleInterop being set.
const createSagaMiddleware: typeof reduxSaga = reduxSaga.default ?? reduxSaga;

type reducerFn = (injectedReducers?: ReducersMapObject) => Reducer;
export function configureStore(createReducer: reducerFn, initialState?: ApplicationBaseState) {
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
    doCompose(...enhancers) as StoreEnhancer
   )

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  // if (module.hot) {
  //   module.hot.accept('./reducers', () => {
  //     forceReducerReload(store);
  //   });
  // }

  return store;
}

//  deepcode ignore no-any: dev-only usage of vars
declare var window: any;
//  deepcode ignore no-any: dev-only usage of vars
declare var module: any;

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
