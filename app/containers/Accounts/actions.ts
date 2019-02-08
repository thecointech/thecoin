import { createReducerFunction } from 'immer-reducer';
import { Dispatch, bindActionCreators, compose } from 'redux';
import { call, select, takeLatest } from 'redux-saga/effects';
import { AccountsReducer, actions, initialState } from './reducer';
import { IActions } from './types';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { selectAccounts } from './selectors';

const reducer = createReducerFunction(AccountsReducer, initialState);

function* sagaDecryptAccount(action: any) {
  const state = yield select(selectAccounts);
  const reducerImp = new AccountsReducer(state, state);
  const fn = reducerImp.decryptAccount.bind(reducerImp);
  const [name, password, callback] = action.payload;
  return yield call(fn, name, password, callback);
}

// Root saga
function* rootSaga() {
  // if necessary, start multiple sagas at once with `all`
  yield takeLatest(actions.decryptAccount.type, sagaDecryptAccount);
}

// Map Disptach to your DispatchProps
export type DispatchProps = IActions;
export function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(actions, dispatch) as any) as IActions;
}

export function buildReducer<T>() {
  const withReducer = injectReducer<T>({
    key: 'accounts',
    reducer: reducer,
    initialState,
  });
  const withSaga = injectSaga<T>({
    key: 'accounts',
    saga: rootSaga
  });

  return compose(
    withReducer,
    withSaga,
  )
}
  
