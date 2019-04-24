import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import {createReducer} from 'reducers';
import createSagaMiddleware from 'redux-saga';
import history from '@the-coin/components/lib/utils/history'

const rootReducer = createReducer();
const router = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware, router);

function configureStore(initialState?: any) {
  let store: any = createStore(rootReducer, initialState, enhancer);
  store.createReducer = createReducer;
  return store;
}

export default { configureStore, history };
