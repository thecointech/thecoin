import { createClient } from '@prismicio/client'
import { SagaReducer } from '@thecointech/redux'
import { IActions, PrismicState } from './types'
import { call } from "@redux-saga/core/effects";
import { log } from '@thecointech/logging'
import type { ApplicationRootState } from 'types'
import type { Locale } from '@thecointech/redux-intl'
import type { ArticleDocument, FaqDocument } from '@thecointech/site-prismic/types';

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT as string;
const client = createClient(apiEndpoint);

const DOCUMENTS_KEY: keyof ApplicationRootState = "documents";

const getOptions = (locale: string) => ({ lang : `${locale}-ca` })
const getByUId = (id: string, locale: string) => client.getByUID('article', id, getOptions(locale));
async function fetchData(locale: string) {
  const articles = await client.getAllByType('article', getOptions(locale))
  const faqs = await client.getAllByType('faq', getOptions(locale))
  return [...articles, ...faqs];
}

const initialState: PrismicState = {
  en: {
    fullyLoaded: false,
    faqs: new Map<string, FaqDocument>(),
    articles: new Map<string, ArticleDocument>(),
  },
  fr: {
    fullyLoaded: false,
    faqs: new Map<string, FaqDocument>(),
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
    const results = (yield call(fetchData, locale)) as Awaited<ReturnType<typeof fetchData>>;
    log.trace(`Fetched: ${!!results}`);
    if (results) {
      const newState = {
        fullyLoaded: true,
        faqs: new Map(docs.faqs),
        articles: new Map(docs.articles),
      }
      results
        .filter(item => item.type === 'faq')
        .forEach(item => newState.faqs.set(item.uid!, item as FaqDocument));
      results
        .filter(item => item.type === 'article')
        .forEach(item => newState.articles.set(item.uid!, item as ArticleDocument))
      yield this.storeValues({
        [locale]: newState
      })
    }
  };
}
