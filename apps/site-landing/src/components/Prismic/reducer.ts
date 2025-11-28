
import { createClient } from '@prismicio/client'
import { SagaReducer } from '@thecointech/redux'
import { ArticleDocument, FAQDocument, IActions, PrismicState } from './types'
import { call } from "@redux-saga/core/effects";
import { log } from '@thecointech/logging'
import type { ApplicationRootState } from 'types'
import type { PrismicDocument } from '@prismicio/types'
import type { Locale } from '@thecointech/redux-intl'

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT as string;
const client = createClient(apiEndpoint);

const DOCUMENTS_KEY: keyof ApplicationRootState = "documents";

const getOptions = (locale: string) => ({ lang : `${locale}-ca` })
const getByUId = (id: string, locale: string) => client.getByUID('article', id, getOptions(locale));
async function fetchData(locale: string) {
  const response = await client.query('', getOptions(locale))
  return response.results;
}

const initialState: PrismicState = {
  en: {
    fullyLoaded: false,
    faqs: new Map<string, FAQDocument>(),
    articles: new Map<string, ArticleDocument>(),
  },
  fr: {
    fullyLoaded: false,
    faqs: new Map<string, FAQDocument>(),
    articles: new Map<string, ArticleDocument>(),
  }
}

export class Prismic extends SagaReducer<IActions, PrismicState>(DOCUMENTS_KEY, initialState, ["fetchAllDocs", "fetchDoc"]) implements IActions
{
  *fetchDoc(uid: string, locale: Locale): Generator<any> {
    // First, do we already have this document cached?
    const cache = this.state[locale].articles;
    if (cache.has(uid))
      return;

    log.trace(`Fetching Single Prismic Doc: ${uid}`);
    const result = (yield call(getByUId, uid, locale)) as ArticleDocument;
    log.trace(`Fetched: ${!!result}`);
    if (result) {
      yield this.storeValues({
        [locale]: {
          articles: new Map(cache).set(uid, result)
        }
      })
    }
  }

  //** Fetch all documents of locale */
  *fetchAllDocs(locale: Locale): Generator<any> {
    // Only fetch docs once
    const docs = this.state[locale];
    if (docs.fullyLoaded) {
      return;
    }
    log.trace(`Fetching Prismic docs for locale: ${locale}`);
    const results = (yield call(fetchData, locale)) as PrismicDocument[];
    log.trace(`Fetched: ${!!results}`);
    if (results) {
      const newState = {
        fullyLoaded: true,
        faqs: new Map(docs.faqs),
        articles: new Map(docs.articles),
      }
      results
        .filter(item => item.type === 'faq')
        .forEach(item => newState.faqs.set(item.uid!, item as FAQDocument));
      results
        .filter(item => item.type === 'article')
        .forEach(item => newState.articles.set(item.uid!, item as ArticleDocument))
      yield this.storeValues({
        [locale]: newState
      })
    }
  };
}

