import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { call, select, takeLatest } from 'redux-saga/effects'
import { createAccountSelector } from './selector';
import { GetNamedReducer } from 'utils/immerReducer';
import { AccountReducer, initialState } from './reducer';

//type AccountSelector = (state:any) => ContainerState|null;

function buildSagas(name: string) {
  const { actions, reducerClass } = GetNamedReducer(AccountReducer, name, initialState)
  const selectAccount = createAccountSelector(name);
  function buildSaga(fnName:string) {
    function* saga(action: any) {
      const state = yield select(selectAccount);
      const reducerImp = new reducerClass(state, state);
      //@ts-ignore
      const fn = reducerImp[fnName].bind(reducerImp);
      const [name, password, callback] = action.payload;
      return yield call(fn, name, password, callback);
    }
    return saga;
  }

  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.decrypt.type, buildSaga("decrypt"));
    yield takeLatest(actions.updateBalance.type, buildSaga("updateBalance"))
    yield takeLatest(actions.updateHistory.type, buildSaga("updateHistory"))
  }

  return rootSaga;
}

// Map Disptach to your DispatchProps
function buildMapDispatchToProps(name: string) {
  const { actions } = GetNamedReducer(AccountReducer, name, initialState);
  return function mapDispatchToProps(dispatch: Dispatch): IActions {
    return (bindActionCreators(actions, dispatch) as any) as IActions;
  }  
}

export { IActions as DispatchProps, buildMapDispatchToProps, buildSagas }