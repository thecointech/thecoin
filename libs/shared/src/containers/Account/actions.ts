import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { call, select, takeLatest, debounce } from 'redux-saga/effects'
import { createAccountSelector } from './selector';
import { getAccountReducer } from './reducer';

//type AccountSelector = (state:any) => ContainerState|null;

function buildSagas(name: string) {
  const { actions, reducerClass } = getAccountReducer(name)
  const selectAccount = createAccountSelector(name);
  function buildSaga(fnName:string) {
    function* saga(action: any) {
      const state = yield select(selectAccount);
      const reducerImp = new reducerClass(state, state);
      //@ts-ignore
      const fn = reducerImp[fnName].bind(reducerImp);
      //const [name, password, callback] = action.payload;
      return yield call(fn, ...action.payload);
    }
    return saga;
  }

  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.decrypt.type, buildSaga("decrypt"));
    yield takeLatest(actions.updateBalance.type, buildSaga("updateBalance"))
    yield debounce(750, actions.updateHistory.type, buildSaga("updateHistory"))
    yield takeLatest(actions.setSigner.type, buildSaga("setSigner"))
  }

  return rootSaga;
}

export const BindActions = (actions: any, dispatch: Dispatch) => 
  (bindActionCreators(actions, dispatch) as any) as IActions;

// Map Disptach to your DispatchProps
export function buildMapDispatchToProps(name: string) {
  const { actions } = getAccountReducer(name);
  return (dispatch: Dispatch) => BindActions(actions, dispatch);
}

export { IActions as DispatchProps, buildSagas }