import { FXRate, RatesApi } from '@the-coin/pricing';
import { CurrencyCode } from '@the-coin/utilities/CurrencyCodes';
import { call, fork, take, delay, takeEvery } from 'redux-saga/effects';
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { ApplicationBaseState } from '../../types';
import { TheCoinReducer, GetNamedReducer } from '../../utils/immerReducer';
import { FxRatesState, IFxRates } from './types';
import { buildSaga, sendValues } from '../../utils/sagas';

const FXRATES_KEY: keyof ApplicationBaseState = "fxRates";

// TODO: We are going to convert this into a live link to the Firestore DB
// The initial state of the App
const initialState: FxRatesState = {
  rates: []
}

// file deepcode ignore ComparisonObjectExpression: <Ignore complaints about comparison vs EmptyRate>
export const EmptyRate: FXRate = {
  target: -1,
  buy: 0,
  sell: 0,
  fxRate: 0,
  validFrom: 0,
  validTill: 0,
};

// Always returns an object
function getFxRate(rates: FXRate[], ts: number): FXRate {
  if (ts == 0 && rates.length > 0)
  {
    return rates.slice(-1)[0];
  }
  return rates.find((rate: FXRate) => rate.validFrom <= ts && rate.validTill > ts) || EmptyRate
}

export const getRate = (rates: FXRate[], date?: Date) => getFxRate(rates, date?.getTime() ?? 0);

function weBuyAt(rates: FXRate[], date?: Date) {
  const { buy, fxRate } = getRate(rates, date);
  return buy * fxRate;
}

function weSellAt(rates: FXRate[], date?: Date) {
  const { sell, fxRate } = getRate(rates, date);
  return sell * fxRate;
}

export async function fetchRate(date?: Date): Promise<FXRate | null> {
  const cc = CurrencyCode.CAD;
  console.log(`fetching fx rate: ${cc} for time ${date?.toLocaleTimeString() ?? "now"}`);
  const api = new RatesApi();
  const r = await api.getConversion(cc, date?.getTime() ?? 0);
  if (r.status != 200 || !r.data.validFrom) {
    if (date)
      console.error(`Error fetching rate for: ${date.getTime()} (${date.toLocaleString()}): ${r.statusText}`)
    else
      console.error(`Error fetching latest rate: ${r.statusText}`);
    return null;
  }
  return r.data;
}

class FxRateReducer extends TheCoinReducer<FxRatesState>
  implements IFxRates {

  *fetchRateAtDate(date?: Date): Generator<any> {
    try {

      if (date != null) {
        const ts = date.getTime();
        if (this.haveRateFor(ts))
          return;
      }

      const newFxRate: FXRate|null = (yield call<typeof fetchRate>(fetchRate, date)) as any;
      if (newFxRate)
        yield this.storeValues({rates: [newFxRate]});
    }
    catch (err) {
      console.error(err);
    }
  }

  updateWithValues(newState: Partial<FxRatesState>) {
    const newRates = [...this.state.rates];
    newState.rates?.forEach(r => {
      if (!this.haveRateFor(r.validFrom))
        newRates.push(r)
    })
    this.draftState.rates = newRates.sort((a, b) => a.validFrom - b.validFrom);
  }

  haveRateFor(ts: number): boolean {
    return this.state.rates.find(r => r.validFrom <= ts && r.validTill > ts) != null;
  }
}

const { actions, reducer, reducerClass } = GetNamedReducer(FxRateReducer, "fxRates", initialState)

//////////////////////////////////////////////////////////////////////////

//
// The loop function waits for updtes
function* loopFxUpdates() {

  let latest = 0;
  let validFrom = 0;
  let endPolling = false;
  while (!endPolling) {
    const rateAction = yield take(actions.updateWithValues.type);
    const {rates} = rateAction.payload as Partial<FxRatesState>;
    if (!rates)
      continue;

    latest = rates.reduce((p, r) => Math.max(p, r.validTill), latest)
    validFrom = rates.reduce((p, r) => Math.max(p, r.validFrom), validFrom)
    // If the clients clock is wrong, we don't wan't to sleep too long
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
    yield takeEvery(actions.fetchRateAtDate.type, buildSaga<FxRateReducer>(reducerClass, selectAccount, "fetchRateAtDate"))
    yield sendValues(actions.fetchRateAtDate);
  }

  return rootSaga;
}

export const useFxRatesStore = () => {
  useInjectReducer({ key: FXRATES_KEY, reducer: reducer });
  useInjectSaga({ key: FXRATES_KEY, saga: buildSagas(FXRATES_KEY) });
}

export { actions, getFxRate, weBuyAt, weSellAt };
