import { takeLatest, debounce } from "@redux-saga/core/effects";
import { type SagaBuilder, buildSaga } from '@thecointech/redux/immerReducer';
import type { IActions, AccountState } from './types';

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

    yield takeLatest(actions.initKycProcess.type, buildSaga(sagaReducer, "initKycProcess"))
    yield takeLatest(actions.checkKycStatus.type, buildSaga(sagaReducer, "checkKycStatus"))

  }
  return rootSaga;
}


