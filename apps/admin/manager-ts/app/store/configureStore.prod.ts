import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import {createReducer} from 'reducers';
import createSagaMiddleware from 'redux-saga';
import history from 'utils/history'

const rootReducer = createReducer();
const router = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware, router);

function configureStore(initialState?: any) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
