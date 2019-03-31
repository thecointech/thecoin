import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { GetNamedReducer } from './reducer';
import { call, select, takeLatest } from 'redux-saga/effects'
import { ApplicationRootState } from 'types';
import { createAccountSelector } from './selector';

//type AccountSelector = (state:any) => ContainerState|null;

function buildSagas(name: keyof ApplicationRootState) {
  const [, actions, reducer] = GetNamedReducer(name)
  const selectAccount = createAccountSelector(name);
  function buildSaga(fnName:string) {
    function* saga(action: any) {
      const state = yield select(selectAccount);
      const reducerImp = new reducer(state, state);
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
function buildMapDispatchToProps(name: keyof ApplicationRootState) {
  const [, actions] = GetNamedReducer(name)
  return function mapDispatchToProps(dispatch: Dispatch): IActions {
    return (bindActionCreators(actions, dispatch) as any) as IActions;
  }  
}

export { IActions as DispatchProps, buildMapDispatchToProps, buildSagas }