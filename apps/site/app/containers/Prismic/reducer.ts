
import Prismic from 'prismic-javascript'
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer'
import { IActions, PrismicState, initialState } from './types'
import { call, takeLatest } from 'redux-saga/effects'
import { Document } from 'prismic-javascript/d.ts/documents'
import { ApplicationRootState } from 'types'
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { buildSaga } from '@the-coin/shared/utils/sagas'

const apiEndpoint = 'https://thecoin.cdn.prismic.io/api/v2'
const accessToken = '' // This is where you would add your access token for a Private repository

export class PrismicReducer extends TheCoinReducer<PrismicState>
	implements IActions
{
  	
  Client = Prismic.client(apiEndpoint, { accessToken });

  *fetchFaqs(): Generator<any> {
	
    const fetchData = async () : Promise<Document[]|null> => {
      const response = await this.Client.query(
        Prismic.Predicates.at('document.type', 'page'),
        {}
      )
      if (response) {
        return response.results;
      }
      return null;
    }
    const results: any = yield call(fetchData);
    if (results)
      yield this.storeValues({faqs: results})
  };
}

// TODO: CLEAN THIS UP!
const DOCUMENTS_KEY: keyof ApplicationRootState = "documents";

const { actions, reducer } = GetNamedReducer(PrismicReducer, "prismic_docs", initialState)
function createRootEntitySelector<T>(rootKey: keyof ApplicationRootState, initialState: T) {
	return (state: ApplicationRootState) : T => state[rootKey] as any || initialState;
}
const rootSelector = createRootEntitySelector("documents", initialState);

export function buildSagas() {

  // Root saga
  function* rootSaga() {
    yield takeLatest(actions.fetchFaqs.type, buildSaga(reducer, rootSelector, "fetchFaqs"));
  }

  return rootSaga;
}


export const usePrismic = () => {
  useInjectReducer({ key: DOCUMENTS_KEY, reducer: reducer });
  useInjectSaga({ key: DOCUMENTS_KEY, saga: buildSagas()});
}