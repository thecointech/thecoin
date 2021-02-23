import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { takeLatest, debounce } from 'redux-saga/effects'
import { getAccountReducer } from './reducer';
import { makeAccountSelector } from './selectors';
import { buildSaga } from '../../store/sagas';


export function buildSagas(address: string) {
  const { actions, reducerClass } = getAccountReducer(address)
  const selectAccount = makeAccountSelector(address);
  const accountSaga = (fn: keyof IActions) => buildSaga<any>(reducerClass, selectAccount, fn)

  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.decrypt.type, accountSaga("decrypt"));
    yield takeLatest(actions.updateBalance.type, accountSaga("updateBalance"))
    yield debounce(750, actions.updateHistory.type, accountSaga("updateHistory"))
    yield takeLatest(actions.setSigner.type, accountSaga("setSigner"))
    yield takeLatest(actions.loadDetails.type, accountSaga("loadDetails"))
    yield takeLatest(actions.setDetails.type, accountSaga("setDetails"))
  }

  return rootSaga;
}

export const bindActions = (actions: any, dispatch: Dispatch) =>
  (bindActionCreators(actions, dispatch) as any) as IActions;
