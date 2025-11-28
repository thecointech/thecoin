/**
 * Create the store with dynamic reducers
 */

import { createInjectorsEnhancer } from 'redux-injectors';
import reduxSaga from '@redux-saga/core';
import { createStore, compose, applyMiddleware, ReducersMapObject, Reducer, StoreEnhancer, PreloadedState } from 'redux';
import { getCreateReducer } from './reducers';
// Ideally, all references to redux should be through this package
export { Provider } from 'react-redux';
export { combineReducers, type ReducersMapObject, type Reducer, type StoreEnhancer, type PreloadedState } from 'redux';
export { BaseReducer } from './immerReducer';

//@ts-ignore weird-o hack to get jest to run this file with no complaints.
// unfortunately jest resolves the CJS version of this file, and somehow
// ts ends up importing the old icky method, despite esModuleInterop being set.
const createSagaMiddleware: typeof reduxSaga = reduxSaga.default ?? reduxSaga;

type reducerFn = (injectedReducers?: ReducersMapObject) => Reducer;
export function configureStore<T extends Record<string, any>>(createReducer: reducerFn = getCreateReducer(), initialState?: PreloadedState<T>) {
  const reduxSagaMonitorOptions = {};


  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with saga middleware
  const middlewares = [sagaMiddleware];

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

  return store;
}

function getCompose()
{
  // TODO: Migrate to modern configureStore
  let composeEnhancers = compose;

  // If Redux Dev Tools and Saga Dev Tools Extensions are installed, enable them
  // if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    /* eslint-disable no-underscore-dangle */
    // if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
    //   composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});

    // NOTE: Uncomment the code below to restore support for Redux Saga
    // Dev Tools once it supports redux-saga version 1.x.x
    // if (window.__SAGA_MONITOR_EXTENSION__)
    //   reduxSagaMonitorOptions = {
    //     sagaMonitor: window.__SAGA_MONITOR_EXTENSION__,
    //   };
    /* eslint-enable */
  // }

  return composeEnhancers;
}
