import { IActions, AccountState } from './types';
import { takeLatest, debounce } from 'redux-saga/effects'
import { SagaBuilder, buildSaga } from '../../store/immerReducer';


export const buildSagas : SagaBuilder<IActions, AccountState> = (sagaReducer) => {
  const { actions } = sagaReducer;
  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.decrypt.type, buildSaga(sagaReducer, "decrypt"));
    yield takeLatest(actions.updateBalance.type, buildSaga(sagaReducer, "updateBalance"))
    yield debounce(750, actions.updateHistory.type, buildSaga(sagaReducer, "updateHistory"))
    yield takeLatest(actions.setSigner.type, buildSaga(sagaReducer, "setSigner"))
    yield takeLatest(actions.connect.type, buildSaga(sagaReducer, "connect"))
    yield takeLatest(actions.loadDetails.type, buildSaga(sagaReducer, "loadDetails"))
    yield takeLatest(actions.setDetails.type, buildSaga(sagaReducer, "setDetails"))
  }
  return rootSaga;
}


