import type { Locale } from '@thecointech/redux-intl'
import type { ArticleDocument, FaqDocument } from '@thecointech/site-prismic/types';
import type { Client } from '@prismicio/client';

export type FaqDocuments = Map<string, FaqDocument>;

export type ArticleDocuments = Map<string, ArticleDocument>;

export type LocaleDocuments = {
  fullyLoaded: boolean,
  faqs: FaqDocuments,
  articles: ArticleDocuments,
}
export type PrismicState = {
  [locale in Locale]: LocaleDocuments;
} & {
  client: Client;
}

export interface IActions {
  // Fetch a single document by ID
  fetchDoc(id: string, locale: Locale): Iterator<any>;

  // Fetch all documents for locale
  fetchAllDocs(locale: Locale): Iterator<any>;

  // Directly set a document.  Used by preview mode
  setDocument(document: ArticleDocument): void;

}
