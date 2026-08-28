import { jest } from '@jest/globals';
import type { AboutDocument, ArticleDocument, FaqDocument } from '@thecointech/site-prismic/types';
import type { PrismicState } from './types';
import { Prismic } from './reducer';

jest.mock('@prismicio/client', () => ({
  createClient: () => ({}),
}));

const about = {
  type: 'about',
  lang: 'en-ca',
} as AboutDocument;

const article = {
  type: 'article',
  uid: 'article-1',
  lang: 'en-ca',
} as ArticleDocument;

const faq = {
  type: 'faq',
  uid: 'faq-1',
  lang: 'en-ca',
} as FaqDocument;

const getState = (): PrismicState => ({
  en: {
    fullyLoaded: false,
    faqs: new Map(),
    articles: new Map(),
    pages: new Map(),
  },
  fr: {
    fullyLoaded: false,
    faqs: new Map(),
    articles: new Map(),
    pages: new Map(),
  },
  loading: 0,
  client: {} as PrismicState['client'],
});

const cloneState = (state: PrismicState): PrismicState => ({
  en: {
    fullyLoaded: state.en.fullyLoaded,
    faqs: new Map(state.en.faqs),
    articles: new Map(state.en.articles),
    pages: new Map(state.en.pages),
  },
  fr: {
    fullyLoaded: state.fr.fullyLoaded,
    faqs: new Map(state.fr.faqs),
    articles: new Map(state.fr.articles),
    pages: new Map(state.fr.pages),
  },
  loading: state.loading,
  client: state.client,
});

it('preserves static pages added while all documents are loading', () => {
  Prismic.initialize();
  const initialState = getState();
  const reducer = new Prismic(initialState, initialState);
  const saga = reducer.fetchAllDocs('en');

  saga.next();
  saga.next();
  const commit = saga.next([]).value as any;
  const update = commit.payload.action.payload as (draft: PrismicState, state: PrismicState) => void;

  const currentState = getState();
  currentState.en.pages.set('about', about);
  const draft = cloneState(currentState);
  update(draft, currentState);

  expect(draft.en.pages.get('about')).toBe(about);
  expect(draft.en.fullyLoaded).toBe(true);
});

it('fetchStaticPage preserves other locale fields and concurrently added pages', () => {
  Prismic.initialize();
  const initialState = getState();
  const reducer = new Prismic(initialState, initialState);
  const saga = reducer.fetchStaticPage('about', 'en');

  saga.next();
  saga.next();
  const commit = saga.next(about).value as any;
  const update = commit.payload.action.payload as (draft: PrismicState, state: PrismicState) => void;

  const currentState = getState();
  currentState.en.articles.set('existing-article', article);
  currentState.en.fullyLoaded = true;

  const draft = cloneState(currentState);
  update(draft, currentState);

  expect(draft.en.pages.get('about')).toBe(about);
  expect(draft.en.articles.get('existing-article')).toBe(article);
  expect(draft.en.fullyLoaded).toBe(true);
});

it('fetchDoc preserves other locale fields and concurrently added articles', () => {
  Prismic.initialize();
  const initialState = getState();
  const reducer = new Prismic(initialState, initialState);
  const saga = reducer.fetchDoc('article-1', 'en');

  saga.next();
  saga.next();
  const commit = saga.next(article).value as any;
  const update = commit.payload.action.payload as (draft: PrismicState, state: PrismicState) => void;

  const currentState = getState();
  currentState.en.pages.set('about', about);
  currentState.en.faqs.set('faq-1', faq);
  currentState.en.fullyLoaded = true;

  const draft = cloneState(currentState);
  update(draft, currentState);

  expect(draft.en.articles.get('article-1')).toBe(article);
  expect(draft.en.pages.get('about')).toBe(about);
  expect(draft.en.faqs.get('faq-1')).toBe(faq);
  expect(draft.en.fullyLoaded).toBe(true);
});

it('fetchAllDocs merges results with existing maps and preserves pages', () => {
  Prismic.initialize();
  const initialState = getState();
  const reducer = new Prismic(initialState, initialState);
  const saga = reducer.fetchAllDocs('en');

  saga.next();
  saga.next();
  const commit = saga.next([article, faq]).value as any;
  const update = commit.payload.action.payload as (draft: PrismicState, state: PrismicState) => void;

  const currentState = getState();
  currentState.en.pages.set('about', about);
  const existingArticle = { ...article, uid: 'existing-article' } as ArticleDocument;
  currentState.en.articles.set('existing-article', existingArticle);

  const draft = cloneState(currentState);
  update(draft, currentState);

  expect(draft.en.fullyLoaded).toBe(true);
  expect(draft.en.pages.get('about')).toBe(about);
  expect(draft.en.articles.get('existing-article')).toBe(existingArticle);
  expect(draft.en.articles.get('article-1')).toBe(article);
  expect(draft.en.faqs.get('faq-1')).toBe(faq);
});

it('interleaved commits do not lose concurrent updates', () => {
  Prismic.initialize();
  const initialState = getState();

  const pageReducer = new Prismic(initialState, initialState);
  const pageSaga = pageReducer.fetchStaticPage('about', 'en');
  pageSaga.next();
  pageSaga.next();

  const docReducer = new Prismic(initialState, initialState);
  const docSaga = docReducer.fetchDoc('article-1', 'en');
  docSaga.next();
  docSaga.next();

  const pageUpdate = (pageSaga.next(about).value as any).payload.action.payload as (draft: PrismicState, state: PrismicState) => void;
  const docUpdate = (docSaga.next(article).value as any).payload.action.payload as (draft: PrismicState, state: PrismicState) => void;

  const currentState = getState();

  const afterPage = cloneState(currentState);
  pageUpdate(afterPage, currentState);

  const afterDoc = cloneState(afterPage);
  docUpdate(afterDoc, afterPage);

  expect(afterDoc.en.pages.get('about')).toBe(about);
  expect(afterDoc.en.articles.get('article-1')).toBe(article);
});
