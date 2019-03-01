import { Dispatch, bindActionCreators } from 'redux';
import { IActions, ContainerState } from './types';
import { actions, AccountReducer } from './reducer';
import { call, select, takeLatest } from 'redux-saga/effects'

type AccountSelector = (state:any) => ContainerState|null;

function buildSagas(selectActiveAccount: AccountSelector ) {

  function buildSaga(fnName:string) {
    function* saga(action: any) {
      const state = yield select(selectActiveAccount);
      const reducerImp = new AccountReducer(state, state);
      const fn = reducerImp[fnName].bind(reducerImp);
      const [name, password, callback] = action.payload;
      return yield call(fn, name, password, callback);
    }
    return saga;
  }

  // Root saga
  function* rootSaga() {
    // if necessary, start multiple sagas at once with `all`
    yield takeLatest(actions.decrypt.type, buildSaga("decrypt"));
    yield takeLatest(actions.updateBalance.type, buildSaga("updateBalance"))
  }

  return rootSaga;
}

// Map Disptach to your DispatchProps
function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(actions, dispatch) as any) as IActions;
}

export { IActions as DispatchProps, mapDispatchToProps, buildSagas }

