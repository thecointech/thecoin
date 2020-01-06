/**
 * Create the store with dynamic reducers
 */

import { configureStore, getDefaultMiddleware, StoreEnhancer } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';
import { createInjectorsEnhancer } from 'redux-injectors';
import createSagaMiddleware from 'redux-saga';
import { ApplicationBaseState } from './types';
import { History } from 'history';

//declare var module: any;

export function configureAppStore(createReducer: () => any, initialState: ApplicationBaseState | {} = {}, history: History<any>) {
  const reduxSagaMonitorOptions = {};

  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions);
  const { run: runSaga } = sagaMiddleware;

  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [sagaMiddleware, routerMiddleware(history)];

  const injectorEnhancer = createInjectorsEnhancer({
    createReducer,
    runSaga,
  })
  const enhancers: StoreEnhancer[] = [
    injectorEnhancer, // Weird type error here.  Seems to be a false positive, as the types seems to 
  ];

  const store = configureStore({
    reducer: createReducer(),
    preloadedState: initialState,
    middleware: [...getDefaultMiddleware(), ...middlewares],
    enhancers,
  });

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  // if (module.hot) {
  //   module.hot.accept('./reducers', () => {
  //     forceReducerReload(store);
  //   });
  // }

  return store;
}
