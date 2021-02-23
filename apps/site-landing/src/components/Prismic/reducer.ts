
import Prismic from 'prismic-javascript'
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/store/immerReducer'
import { IActions, PrismicState, initialState } from './types'
import { call, takeLatest } from 'redux-saga/effects'
import { Document } from 'prismic-javascript/d.ts/documents'
import { ApplicationRootState } from 'types'
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { buildSaga } from '@the-coin/shared/store/sagas'
import { useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'

const apiEndpoint = 'https://thecoinio.cdn.prismic.io/api/v2'
const accessToken = '' // This is where you would add your access token for a Private repository
const Client = Prismic.client(apiEndpoint, { accessToken });
console.log(Client);
export class PrismicReducer extends TheCoinReducer<PrismicState>
	implements IActions
{


  *fetchFaqs(): Generator<any> {

    // Only fetch FAQ's once
    if (this.state.faqs.length !== 0) {
      console.log("FAQs already fetched, nothing to do");
      return;
    }

    const fetchData = async () : Promise<Document[]|null> => {
      const response = await Client.query(
        '', //Prismic.Predicates.at('document.type', 'faq'),
        {}
      )
      if (response) {
        return response.results;
      }
      return null;
    }
    const results: Document[] = (yield call(fetchData)) as any;
    if (results)
      yield this.storeValues({
        faqs: results.filter(item => item.type === 'the_coin_faq') ?? [],
        articles: results.filter(item => item.type === 'the_coin_faq') ?? []
      })
  };
}

// TODO: CLEAN THIS UP!
const DOCUMENTS_KEY: keyof ApplicationRootState = "documents";

const { actions, reducer, reducerClass } = GetNamedReducer(PrismicReducer, "prismic_docs", initialState)
function createRootEntitySelector<T>(rootKey: keyof ApplicationRootState, initialState: T) {
	return (state: ApplicationRootState) : T => state[rootKey] as any || initialState;
}
const rootSelector = createRootEntitySelector("documents", initialState);

function* rootSaga() {
  yield takeLatest(actions.fetchFaqs.type, buildSaga<PrismicReducer>(reducerClass, rootSelector, "fetchFaqs"));
}

export const usePrismic = () => {
  useInjectReducer({ key: DOCUMENTS_KEY, reducer: reducer });
  useInjectSaga({ key: DOCUMENTS_KEY, saga: rootSaga});
}

export const usePrismicActions = () =>
  (bindActionCreators(actions, useDispatch()) as any) as IActions;
