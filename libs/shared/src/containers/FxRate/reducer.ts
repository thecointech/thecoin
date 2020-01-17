import { FXRate, RatesApi } from '@the-coin/pricing';
import { CurrencyCodes } from '@the-coin/utilities/CurrencyCodes';
import { call, fork, take, delay, takeEvery } from 'redux-saga/effects';
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { ApplicationBaseState } from '../../types';
import { TheCoinReducer, GetNamedReducer } from '../../utils/immerReducer';
import { ContainerState, IActions } from './types';
import { buildSaga, sendValues } from '../../utils/sagas';

const FXRATES_KEY: keyof ApplicationBaseState = "fxRates";

// The initial state of the App
const initialState: ContainerState = {
  rates: []
}

// file deepcode ignore ComparisonObjectExpression: <Ignore complaints about comparison vs EmptyRate>
const EmptyRate: FXRate = {
  target: -1,
  buy: 0,
  sell: 0,
  fxRate: 0,
  validFrom: 0,
  validTill: 0,
};

// Always returns an object
function getFxRate(rates: FXRate[], ts: number): FXRate {
  return rates.find((rate: FXRate) => rate.validFrom <= ts && rate.validTill > ts) || EmptyRate
}

const getRate = (rates: FXRate[], date?: Date) => getFxRate(rates, date ? date.getTime() : Date.now());

function weBuyAt(rates: FXRate[], date?: Date) {
  const { buy, fxRate } = getRate(rates, date);
  return buy * fxRate;
}

function weSellAt(rates: FXRate[], date?: Date) {
  const { sell, fxRate } = getRate(rates, date);
  return sell * fxRate;
}

async function fetchRates(date: Date): Promise<FXRate | null> {
  const cc = CurrencyCodes.CAD;
  console.log(`fetching fx rate: ${cc} for time ${date.toLocaleTimeString()}`);
  const api = new RatesApi();
  const r = await api.getConversion(cc, date.getTime());
  if (r.status != 200 || !r.data.validFrom) {
    console.error(`Error fetching rate for: ${date.getTime()} (${date.toLocaleString()}): ${r.statusText}`)
    return null;
  }
  return r.data;
}

class FxRateReducer extends TheCoinReducer<ContainerState>
  implements IActions {

  *fetchRateAtDate(date?: Date): Generator<any> {
    try {

      const updateDate = date ? date : new Date();
      const ts = updateDate.getTime();
      if (this.haveRateFor(ts))
        return;

      const newFxRate: FXRate|null = (yield call<typeof fetchRates>(fetchRates, updateDate)) as any;
      if (newFxRate)
        yield this.storeValues({rates: [newFxRate]});
    }
    catch (err) {
      console.error(err);
    }
  }

  updateWithValues(newState: Partial<ContainerState>) {
    newState.rates?.forEach(r => {
      if (!this.haveRateFor(r.validFrom))
        this.draftState.rates.push(r)
    })
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
  let endPolling = false;
  while (!endPolling) {
    const rateAction = yield take(actions.updateWithValues.type);
    const {rates} = rateAction.payload as Partial<ContainerState>;
    if (!rates)
      continue;

    latest = rates.reduce((p, r) => Math.max(p, r.validTill), latest)
    const now = Date.now();
    // wait at least 5 seconds till update
    const waitTime = Math.max(latest - now, 5000);
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
    yield takeEvery(actions.fetchRateAtDate.type, buildSaga(reducerClass, selectAccount, "fetchRateAtDate"))
    yield sendValues(actions.fetchRateAtDate);
  }

  return rootSaga;
}

export const useFxRates = () => {
  useInjectReducer({ key: FXRATES_KEY, reducer: reducer });
  useInjectSaga({ key: FXRATES_KEY, saga: buildSagas(FXRATES_KEY) });
}

export { actions, getFxRate, weBuyAt, weSellAt };
