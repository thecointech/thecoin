import { call, fork, take, delay, takeEvery, Effect } from "@redux-saga/core/effects";
import { SagaReducer, buildSaga, SagaBuilder } from '@thecointech/redux/immerReducer';
import { sendValues } from '@thecointech/redux/sagas';
import { fetchRate, FXRate } from '@thecointech/fx-rates';
import type { ApplicationBaseState } from '../../types';
import type { FxRatesState, IFxRates } from './types';
import { log } from "@thecointech/logging";

const FXRATES_KEY: keyof ApplicationBaseState = "fxRates";

// TODO: We are going to convert this into a live link to the Firestore DB
// The initial state of the App
const initialState: FxRatesState = {
  rates: [],
  fetching: 0,
}


const buildSagas: SagaBuilder<IFxRates, FxRatesState> = (sagaReducer) => {

  function* rootSaga() {
    const saga = buildSaga(sagaReducer, "fetchRateAtDate")
    yield fork(loopFxUpdates);
    yield takeEvery(sagaReducer.actions.fetchRateAtDate.type, saga)
    yield sendValues(sagaReducer.actions.fetchRateAtDate);
  }

  return rootSaga;
}


export class FxRateReducer extends SagaReducer<IFxRates, FxRatesState>(FXRATES_KEY, initialState, buildSagas)
  implements IFxRates {

  *fetchRateAtDate(date?: Date): Generator<any> {

    // early exit.
    if (date != null) {
      const ts = date.getTime();
      if (this.haveRateFor(ts))
        return;
    }

    // We can modify the draft state up until the first yield
    yield this.storeValues({fetching: +1});
    const newState = {
      fetching: -1,
      rates: [] as FXRate[]
    }
    try {
      const newFxRate: FXRate|null = (yield call(fetchRate, date)) as any;
      if (newFxRate)
        newState.rates = [newFxRate];
    }
    catch (err) {
      log.error(err, "Failed to fetch rates at date: ", date);
    }
    // Even in the case of the throw, we store values to decrement our counter
    yield this.storeValues(newState);
  }

  // Overwrites the default update to ensure we save no duplicates;
  updateWithValues(newState: Partial<FxRatesState>) {
    // Insert new rates into the old, keeping sorted
    if (newState.rates?.length) {
      const newRates = [...this.state.rates];
      newState.rates?.forEach(r => {
        if (!this.haveRateFor(r.validFrom))
          newRates.push(r)
      })
      this.draftState.rates = newRates.sort((a, b) => a.validFrom - b.validFrom);
    }

    // If we have completed a fetch, remove the counter
    this.draftState.fetching = this.state.fetching + (newState.fetching ?? 0);
  }

  haveRateFor(ts: number): boolean {
    return this.state.rates.find(r => r.validFrom <= ts && r.validTill > ts) != null;
  }
}

//////////////////////////////////////////////////////////////////////////

//
// The loop function waits for updtes
function* loopFxUpdates() : Generator<Effect> {

  let latest = 0;
  let validFrom = 0;
  let endPolling = false;
  while (!endPolling) {
    // Wait until sets new update and stores values
    const rateAction = yield take(FxRateReducer.actions.updateWithValues.type);
    const {rates} = (rateAction as ReturnType<typeof FxRateReducer.prototype.actions.updateWithValues>).payload;
    if (!rates)
      continue;

    latest = rates.reduce((p, r) => Math.max(p, r.validTill), latest)
    validFrom = rates.reduce((p, r) => Math.max(p, r.validFrom), validFrom)
    // If the clients clock is wrong, we don't wan't to sleep too long
    // TODO: get time from the server
    const now = Math.max(Date.now(), validFrom);

    // wait at least 10 seconds till update, or 100ms past update time
    const waitTime = Math.max(100 + latest - now, 120000);
    console.log("Fx fetched - now sleeping mins: " + waitTime / (1000 * 60));
    yield delay(waitTime);
    // Then tell the FxRate to update
    yield sendValues(FxRateReducer.actions.fetchRateAtDate);
  }
}
