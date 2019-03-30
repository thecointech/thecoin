import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { createReducer } from 'reducers';
import { History } from 'history';
import { LifeStore } from 'types';

const sagaMiddleware = createSagaMiddleware();

const configureStore = (initialState = {}, history: History<any>) => {
  // Redux Configuration
  const middleware = [sagaMiddleware, routerMiddleware(history)];
  const enhancers = [];

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));

  // Create Store
  const store = createStore(
    createReducer(), 
    initialState,
    composeEnhancers(...enhancers)
  ) as LifeStore;

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  store.injectedSagas = {}; // Saga registry

  if ((module as any).hot) {
    (module as any).hot.accept(
      '../reducers', // eslint-disable-next-line global-require
      () => store.replaceReducer(createReducer(store.injectedReducers))
    );
  }

  return store;
};

export default { configureStore, history };
