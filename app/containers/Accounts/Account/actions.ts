import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { actions, AccountReducer } from './reducer';
import { selectActiveAccount } from '../selectors';
import { call, select, takeLatest } from 'redux-saga/effects'


function* sagaDecrypt(action: any) {
  const state = yield select(selectActiveAccount);
  const reducerImp = new AccountReducer(state, state);
  const fn = reducerImp.decrypt.bind(reducerImp);
  const [name, password, callback] = action.payload;
  return yield call(fn, name, password, callback);
}

// Root saga
function* rootSaga() {
  // if necessary, start multiple sagas at once with `all`
  yield takeLatest(actions.decrypt.type, sagaDecrypt);
}

// Map Disptach to your DispatchProps
function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(actions, dispatch) as any) as IActions;
}

export { IActions as DispatchProps, mapDispatchToProps, rootSaga }

