import { FXRate, RatesApi } from '@the-coin/pricing';
import { CurrencyCodes } from '@the-coin/utilities/lib/CurrencyCodes';
import { compose } from 'redux';
import { call, fork, put, select, take, delay, takeEvery } from 'redux-saga/effects';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { selectFxRate } from './selectors';
import { ContainerState, IActions } from './types';
import { ApplicationRootState } from 'types';
import { TheCoinReducer, GetNamedReducer }  from 'utils/immerReducer';

// The initial state of the App
const initialState: ContainerState = {
	rates: []
}

const EmptyRate: FXRate = {
	target: -1,
	buy: 0,
	sell: 0,
	fxRate: 0,
	validFrom: 0,
	validTill: 0,
};

// Always returns an object
function getFxRate(rates: FXRate[], ts: number) {
	return rates.find((rate: FXRate) => rate.validFrom <= ts && rate.validTill > ts) || EmptyRate
}

class FxRateReducer extends TheCoinReducer<ContainerState>
	implements IActions
{

	*fetchRateAtDate(date: Date) {
		try {

			const cc = CurrencyCodes.CAD;
			const ts = date.getTime();
			const rate = getFxRate(this.state.rates, ts);
			if (rate != EmptyRate)
				return;
			console.log("fetching fx rate: %d for time %s", cc, date.toLocaleTimeString());
			const api = new RatesApi();
			const getConversion = api.getConversion.bind(api);
			const newFxRate = yield call(getConversion, cc, ts);
			yield put({
				type: this.actions().addFxRate.type,
				payload: [newFxRate],
				args: true
			})	
		}
		catch (err) {
			console.error(err);
		}
	}

	*fetchLatestRate() {

	}

	addFxRate(newRate: FXRate): void {
		// First check if the rate is already registered
		if (getFxRate(this.state.rates, newRate.validFrom).buy != 0)
			return;
		// Search is not ordered, so our push doesn't need to be either
		this.draftState.rates.push(newRate);
	}
}

const { actions, reducer, reducerClass } = GetNamedReducer(FxRateReducer, "fxRates", initialState)

//////////////////////////////////////////////////////////////////////////

function* sagaUpdateFxRate() {
  const state = yield select(selectFxRate);
  const reducerImp = new FxRateReducer(state, state);
  const fn = reducerImp.fetchRateAtDate.bind(reducerImp);
  return yield call(fn, new Date());
}

//
// The loop function waits for updtes 
function* loopFxUpdates() {

	let latest = 0;
	let endPolling = false;
	while (!endPolling) {
		const rateAction = yield take(actions.addFxRate.type);
		const [newRate] = rateAction.payload as [FXRate];
		latest = Math.max(newRate.validTill, latest)
    const now = Date.now();
    // wait at least 5 seconds till update
		const waitTime = Math.max(latest - now, 5000);
		console.log("Fx fetched - now sleeping mins: " + waitTime / (1000 * 60));
		yield delay(waitTime);
		// Then tell the FxRate to update
		yield call(sagaUpdateFxRate);
	}	
}

function createRootEntitySelector<T>(rootKey: keyof ApplicationRootState, initialState: T) {
	return (state: ApplicationRootState) : T => state[rootKey] || initialState;
}

function buildSagas(name: keyof ApplicationRootState) {
  
  const selectAccount = createRootEntitySelector(name, initialState);

	function buildSaga(fnName: string) {
		function* saga(action: any) {
			const state = yield select(selectAccount);
			const reducerImp = new reducerClass(state, state);
			const fn = reducerImp[fnName].bind(reducerImp);
			//const [name, password, callback] = action.payload;
			return yield call(fn, action.payload);
		}
		return saga;
	}
  // Root saga
  function* rootSaga() {
		
		yield fork(loopFxUpdates);
		yield call(sagaUpdateFxRate)
		yield takeEvery(actions.fetchRateAtDate.type, buildSaga("fetchRateAtDate"))
	}
	
	return rootSaga;
}

function buildReducer<T>() {

	const withReducer = injectReducer<T>({
		key: 'fxRates',
		reducer: reducer
	});

	const withSaga = injectSaga<T>({
    key: 'fxRates',
    saga: buildSagas('fxRates')
  });

  return compose(
    withReducer,
    withSaga,
  )
}

export { buildReducer, actions, getFxRate };
