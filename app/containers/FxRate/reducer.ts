import { FXRate, RatesApi } from '@the-coin/pricing';
import { CurrencyCodes } from '@the-coin/utilities/lib/CurrencyCodes';
import { ActionCreators, createActionCreators, createReducerFunction, ImmerReducer } from 'immer-reducer';
import { compose } from 'redux';
import { delay } from 'redux-saga';
import { call, fork, put, select, take } from 'redux-saga/effects';
import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import { selectFxRate } from './selectors';
import { ContainerState, IActions } from './types';

// The initial state of the App
const initialState: ContainerState = {
	target: -1,
	buy: 0,
	sell: 0,
	fxRate: 0,
	validFrom: 0,
	validTill: 0,
};

class FxRateReducer extends ImmerReducer<ContainerState>
	implements IActions {

	*beginUpdateFxRate() {
		try {
			const cc = CurrencyCodes.CAD;
			const now = Date.now();
			console.log("fetching fx rate: %d at time %s", cc, new Date(now).toLocaleTimeString());
			const api = new RatesApi();
			// TODO: Support arbitrary currency codes
			const getConversion = api.getConversion.bind(api);
			const newFxRate = yield call(getConversion, cc, now);
			yield put({
				type: FxRateReducer.actions.updateFxRate.type,
				payload: [newFxRate],
				args: true
			})	
		}
		catch (err) {
			console.error(err);
		}
	}

	updateFxRate(newRate: FXRate): void {
		Object.assign(this.draftState, newRate);
	}

	static actions: ActionCreators<typeof FxRateReducer>;
}

//////////////////////////////////////////////////////////////////////////

const reducer = createReducerFunction(FxRateReducer, initialState);
const actions = createActionCreators(FxRateReducer);
FxRateReducer.actions = actions;

function* sagaUpdateFxRate() {
  const state = yield select(selectFxRate);
  const reducerImp = new FxRateReducer(state, state);
  const fn = reducerImp.beginUpdateFxRate.bind(reducerImp);
  return yield call(fn);
}

function* loopFxUpdates() {
	let endPolling = false;
	while (!endPolling) {
		const rateAction = yield take(FxRateReducer.actions.updateFxRate.type);
    const [newRate] = rateAction.payload as [FXRate];
    const now = Date.now();
    // wait at least 5 seconds till update
		const waitTime = Math.max(newRate.validTill - now, 5000);
		console.log("Fx fetched - now sleeping mins: " + waitTime / (1000 * 60));
		yield call(delay, waitTime);
		yield call(sagaUpdateFxRate);
	}	
}

// Root saga
function* rootSaga() {
	// if necessary, start multiple sagas at once with `all`
	yield fork(loopFxUpdates);
  yield call(sagaUpdateFxRate)
}

function buildReducer<T>() {
	const withReducer = injectReducer<T>({
		key: 'fxRates',
		reducer: reducer,
		initialState,
	});

	const withSaga = injectSaga<T>({
    key: 'fxRates',
    saga: rootSaga
  });

  return compose(
    withReducer,
    withSaga,
  )
}

export { buildReducer, actions };

