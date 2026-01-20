import { call, fork, take, delay, takeEvery, Effect } from "@redux-saga/core/effects";
import { SagaReducer, buildSaga, SagaBuilder, sendValues } from '@thecointech/redux/immerReducer';
import { fetchRate, FXRate } from '@thecointech/fx-rates';
import type { ApplicationBaseState } from '../../types';
import type { FxRatesState, IFxRates } from './types';
import { log } from "@thecointech/logging";

const FXRATES_KEY: keyof ApplicationBaseState = "fxRates";

// TODO: We are going to convert this into a live link to the Firestore DB
// The initial state of the App
const initialState: FxRatesState = {
  rates: [],
  inFlight: [],
}

const buildSagas: SagaBuilder<IFxRates, FxRatesState> = (sagaReducer) => {

  function* rootSaga() {
    const saga = buildSaga(sagaReducer, "fetchRateAtDate")
    const batchSaga = buildSaga(sagaReducer, "fetchRatesForDates")
    yield fork(ensureUpdateOnExpiration);
    yield takeEvery(sagaReducer.actions.fetchRateAtDate.type, saga)
    yield takeEvery(sagaReducer.actions.fetchRatesForDates.type, batchSaga)
  }

  return rootSaga;
}

export class FxRateReducer extends SagaReducer<IFxRates, FxRatesState>(FXRATES_KEY, initialState, buildSagas)
  implements IFxRates {

  *fetchRateAtDate(date: Date): Generator<any> {
    const ts = date.getTime();

    // early exit.
    if (haveSeen(this.state, ts))
      return;

    // Mark as in-flight
    yield this.storeValues(addInFlight([ts]));

    try {
      const newFxRate: FXRate|null = (yield call(fetchRate, date)) as any;
      if (newFxRate) {
        // Remove from in-flight and store results
        yield this.storeValues(updateRates([newFxRate]));
      }
    }
    catch (err) {
      log.error(err, "Failed to fetch rates at date: ", date);
      yield this.storeValues(removeInFlight([ts]));
    }
  }

  *fetchRatesForDates(dates: Date[]): Generator<any> {
    // Filter out dates we already have rates for OR are currently in-flight
    const datesToFetch = dates.filter(date => !haveSeen(this.state, date.getTime()));
    if (datesToFetch.length === 0) {
      return;
    }

    // Mark all dates as in-flight
    const timestamps = datesToFetch.map(d => d.getTime());
    yield this.storeValues(addInFlight(timestamps));

    try {
      log.trace({count: datesToFetch.length}, "Batch fetching {count} FX rates");
      const newRates = [] as FXRate[];

      // Fetch rates sequentially to avoid overwhelming the API
      // (could be made parallel with all() if needed)
      for (const date of datesToFetch) {
        try {
          const fxRate: FXRate|null = (yield call(fetchRate, date)) as any;
          if (fxRate) {
            newRates.push(fxRate);
          }
        } catch (err) {
          log.error(err, "Failed to fetch rate for date: ", date);
          // Continue with other dates even if one fails
        }
      }

      log.trace({fetched: newRates.length, requested: datesToFetch.length},
        "Batch fetched {fetched}/{requested} FX rates");

      yield this.storeValues(updateRates(newRates));
    }
    catch (err) {
      log.error(err, "Failed to batch fetch rates");

      // Remove from in-flight and store all fetched rates in a single update
      yield this.storeValues(removeInFlight(timestamps));
    }
  }
}

const haveRateFor = (rates: FXRate[], ts: number): boolean => {
  return rates.find(r => r.validFrom <= ts && r.validTill > ts) != null;
}
const haveSeen = (state: FxRatesState, ts: number): boolean => {
  return state.inFlight.includes(ts) || haveRateFor(state.rates, ts);
}

const addInFlight = (timestamps: number[]) => {
  return (draft: FxRatesState) => {
    draft.inFlight.push(...timestamps);
  }
}
const removeInFlight = (timestamps: number[]) => {
  return (draft: FxRatesState) => {
    draft.inFlight = draft.inFlight.filter(t => !timestamps.includes(t));
  }
}

const updateRates = (rates: FXRate[]) => {
  return (draft: FxRatesState, state: Readonly<FxRatesState>) => {
    // First, remove all in-flight that are within the valid range of the new rates
    draft.inFlight = state.inFlight.filter(t => !haveRateFor(rates, t));

    // Next, ensure that we don't duplicate any existing rate.
    const newRates = rates.filter(r =>
      !state.rates.find(r2 =>
        r2.validFrom == r.validFrom &&
        r2.validTill == r.validTill
      )
    );
    if (newRates.length === 0) {
      return;
    }

    draft.rates = [...state.rates, ...rates].sort((a, b) => a.validFrom - b.validFrom);
  }
}

//////////////////////////////////////////////////////////////////////////
//
// Wait until the current rate is about to expire and trigger an update.
function* ensureUpdateOnExpiration() : Generator<Effect> {

  // Give the system time to initialize
  yield delay(100);

  let latest = 0;
  let validFrom = 0;
  let endPolling = false;
  while (!endPolling) {
    // Wait until sets new update and stores values
    const rateAction = yield take(FxRateReducer.actions.updateWithValues.type);
    const payload = (rateAction as ReturnType<typeof FxRateReducer.actions.updateWithValues>).payload;
    if (typeof payload === 'function' || !payload.rates) {
      // If we don't have any rates, wait a bit and try again
      yield delay(100);
      continue;
    }

    latest = payload.rates.reduce((p, r) => Math.max(p, r.validTill), latest)
    validFrom = payload.rates.reduce((p, r) => Math.max(p, r.validFrom), validFrom)
    // If the clients clock is wrong, we don't wan't to sleep too long
    // TODO: get time from the server
    const now = Math.max(Date.now(), validFrom);

    // wait at least 10 seconds till update, or 100ms past update time
    const waitTime = Math.max(100 + latest - now, 120000);
    console.log("Fx fetched - now sleeping mins: " + waitTime / (1000 * 60));
    yield delay(waitTime);
    // Then tell the FxRate to update
    yield sendValues(FxRateReducer.actions.fetchRateAtDate, new Date());
  }
}
