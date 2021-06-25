
import Prismic from 'prismic-javascript'
import { TheCoinReducer } from '@thecointech/shared/store/immerReducer'
import { IActions, PrismicState, initialState } from './types'
import { call, takeLatest } from 'redux-saga/effects'
import { Document } from 'prismic-javascript/d.ts/documents'
import { ApplicationRootState } from 'types'
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { buildSaga } from '@thecointech/shared/store/sagas'
import { useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT as string;
const accessToken = process.env.PRISMIC_API_ACCESSTOKEN;
const Client = Prismic.client(apiEndpoint, { accessToken });

export class PrismicReducer extends TheCoinReducer<PrismicState> implements IActions
{

  *fetchAllDocs(): Generator<any> {

    // Only fetch FAQ's once
    if (this.state.faqs.length !== 0) {
      console.log("FAQs already fetched, nothing to do");
      return;
    }

    const fetchData = async () : Promise<Document[]|null> => {
      const response = await Client.query(
        //'', //Prismic.Predicates.at('document.type', 'faq'),
        //Prismic.Predicates.at('document.type', 'faq'),
        '',
        { lang : '*' }
      )
      if (response) {
        return response.results;
      }
      return null;
    }
    const results: Document[] = (yield call(fetchData)) as any;
    if (results)
      yield this.storeValues({
        faqs: results.filter(item => item.type === 'faq') ?? [],
        articles: results.filter(item => item.type === 'article') ?? []
      })
  };
}

const { reducer, actions } =  PrismicReducer.buildReducers(PrismicReducer, initialState);

// TODO: CLEAN THIS UP! All of our reducer creation/maintenance is unfinished, with utility fn's
// (like createRootEntitySelector here) left scattered in various classes
const DOCUMENTS_KEY: keyof ApplicationRootState = "documents";

function createRootEntitySelector<T>(rootKey: keyof ApplicationRootState, initialState: T) {
	return (state: ApplicationRootState) : T => state[rootKey] as any || initialState;
}
const rootSelector = createRootEntitySelector("documents", initialState);

function* rootSaga() {
  yield takeLatest(actions.fetchAllDocs.type, buildSaga<PrismicReducer>(PrismicReducer, rootSelector, "fetchAllDocs"));
}

export const usePrismic = () => {

  useInjectReducer({ key: DOCUMENTS_KEY, reducer });
  useInjectSaga({ key: DOCUMENTS_KEY, saga: rootSaga});
}

export const usePrismicActions = () =>
  (bindActionCreators(actions, useDispatch()) as unknown) as IActions;
