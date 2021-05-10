import { IActions } from './types';
import { takeLatest, debounce } from 'redux-saga/effects'
import { makeAccountSelector } from './selectors';
import { buildSaga } from '../../store/sagas';
import { ActionCreators } from 'immer-reducer';


export function buildSagas(address: string, actions: ActionCreators<any>, reducerClass: any) {
  const selectAccount = makeAccountSelector(address);
  const accountSaga = (fn: keyof IActions) => buildSaga<any>(reducerClass, selectAccount, fn)

  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.decrypt.type, accountSaga("decrypt"));
    yield takeLatest(actions.updateBalance.type, accountSaga("updateBalance"))
    yield debounce(750, actions.updateHistory.type, accountSaga("updateHistory"))
    yield takeLatest(actions.setSigner.type, accountSaga("setSigner"))
    yield takeLatest(actions.connect.type, accountSaga("connect"))
    yield takeLatest(actions.loadDetails.type, accountSaga("loadDetails"))
    yield takeLatest(actions.setDetails.type, accountSaga("setDetails"))
  }

  return rootSaga;
}


