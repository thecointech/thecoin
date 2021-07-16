import { call, fork, take, delay, takeEvery, Effect } from 'redux-saga/effects';
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { ApplicationBaseState } from '../../types';
import { TheCoinReducer } from '../../store/immerReducer';
import { FxRatesState, IFxRates } from './types';
import { buildSaga, sendValues } from '../../store/sagas';
import { fetchRate, FXRate } from '@thecointech/fx-rates';

const FXRATES_KEY: keyof ApplicationBaseState = "fxRates";

// TODO: We are going to convert this into a live link to the Firestore DB
// The initial state of the App
const initialState: FxRatesState = {
  rates: [],
  fetching: 0,
}


class FxRateReducer extends TheCoinReducer<FxRatesState>
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
      console.error(err);
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

const { reducer, actions } = FxRateReducer.buildReducers(FxRateReducer, initialState);

//////////////////////////////////////////////////////////////////////////

//
// The loop function waits for updtes
function* loopFxUpdates() : Generator<Effect> {

  let latest = 0;
  let validFrom = 0;
  let endPolling = false;
  while (!endPolling) {
    // Wait until sets new update and stores values
    const rateAction = yield take(actions.updateWithValues.type);
    const {rates} = (rateAction as ReturnType<typeof actions.updateWithValues>).payload;
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
    yield sendValues(actions.fetchRateAtDate);
  }
}

function createRootEntitySelector<T>(rootKey: keyof ApplicationBaseState, initialState: T) {
  return (state: ApplicationBaseState): T => state[rootKey] as any || initialState;
}

function buildSagas(name: keyof ApplicationBaseState) {

  const selectAccount = createRootEntitySelector(name, initialState);

  function* rootSaga() {
    yield fork(loopFxUpdates);
    yield takeEvery(actions.fetchRateAtDate.type, buildSaga<FxRateReducer>(FxRateReducer, selectAccount, "fetchRateAtDate"))
    yield sendValues(actions.fetchRateAtDate);
  }

  return rootSaga;
}

export const useFxRatesStore = () => {
  useInjectReducer({ key: FXRATES_KEY, reducer: reducer });
  useInjectSaga({ key: FXRATES_KEY, saga: buildSagas(FXRATES_KEY) });
}

export { actions };
