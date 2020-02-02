import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { call, select, takeLatest, debounce } from 'redux-saga/effects'
import { getAccountReducer } from './reducer';
import { makeAccountSelector } from './selectors';

//type AccountSelector = (state:any) => ContainerState|null;

export function buildSagas(address: string) {
  const { actions, reducerClass } = getAccountReducer(address)
  const selectAccount = makeAccountSelector(address);
  function buildSaga(fnName:string) {
    function* saga(action: any) {
      const state = yield select(selectAccount);
      const reducerImp = new reducerClass(state, state);
      //@ts-ignore
      //const fn = reducerImp[fnName].bind(reducerImp);
      //const [address, password, callback] = action.payload;
      return yield call([reducerImp, fnName], ...action.payload);
    }
    return saga;
  }

  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.decrypt.type, buildSaga("decrypt"));
    yield takeLatest(actions.updateBalance.type, buildSaga("updateBalance"))
    yield debounce(750, actions.updateHistory.type, buildSaga("updateHistory"))
    //yield takeLatest(actions.setSigner.type, buildSaga("setSigner"))
  }

  return rootSaga;
}

export const bindActions = (actions: any, dispatch: Dispatch) =>
  (bindActionCreators(actions, dispatch) as any) as IActions;
