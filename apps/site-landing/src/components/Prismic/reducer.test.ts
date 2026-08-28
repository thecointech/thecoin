import { jest } from '@jest/globals';
import type { AboutDocument } from '@thecointech/site-prismic/types';
import type { PrismicState } from './types';
import { Prismic } from './reducer';

jest.mock('@prismicio/client', () => ({
  createClient: () => ({}),
}));

const about = {
  type: 'about',
  lang: 'en-ca',
} as AboutDocument;

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
  const draft = getState();
  update(draft, currentState);

  expect(draft.en.pages.get('about')).toBe(about);
  expect(draft.en.fullyLoaded).toBe(true);
});
