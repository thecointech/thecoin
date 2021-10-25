
import prismicApi from '@prismicio/client'
import { SagaReducer } from '@thecointech/shared/store/immerReducer'
import { IActions, PrismicState, initialState } from './types'
import { call } from 'redux-saga/effects'
import { log } from '@thecointech/logging'
import type { ApplicationRootState } from 'types'
import type { Document } from '@prismicio/client/types/documents'

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT as string;
const Client = prismicApi.client(apiEndpoint);

const DOCUMENTS_KEY: keyof ApplicationRootState = "documents";

async function fetchData(_locale: string) {
  const response = await Client.query(
    //'', //Prismic.Predicates.at('document.type', 'faq'),
    //Prismic.Predicates.at('document.type', 'faq'),
    '',
    { lang : '*' }
  )
  return response.results;
}
export class Prismic extends SagaReducer<IActions, PrismicState>(DOCUMENTS_KEY, initialState, ["fetchAllDocs"]) implements IActions
{
  *fetchAllDocs(locale: string): Generator<any> {

    log.trace("Fetching Prismic docs");
    // Only fetch FAQ's once
    if (this.state.faqs.length !== 0) {
      log.trace("FAQs already fetched, nothing to do");
      return;
    }

    const results = (yield call(fetchData, locale)) as Document[];
    if (results)
      yield this.storeValues({
        faqs: results.filter(item => item.type === 'faq') ?? [],
        articles: results.filter(item => item.type === 'article') ?? []
      })
  };
}

