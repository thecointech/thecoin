import type { Locale } from '@thecointech/redux-intl'
import type { ArticleDocument, FaqDocument, AboutDocument } from '@thecointech/site-prismic/types';
import type { Client } from '@prismicio/client';

export type FaqDocuments = Map<string, FaqDocument>;

export type ArticleDocuments = Map<string, ArticleDocument>;

export type StaticPageDocument = AboutDocument;
export type StaticPageType = StaticPageDocument["type"];

export type LocaleDocuments = {
  fullyLoaded: boolean,
  faqs: FaqDocuments,
  articles: ArticleDocuments,
  pages: Map<StaticPageType, StaticPageDocument>,
}
export type PrismicState = {
  [locale in Locale]: LocaleDocuments;
} & {
  loading: number;
  client: Client;
}

export interface IActions {


  // Fetch static pages
  fetchStaticPage(type: StaticPageType, locale: Locale): Iterator<any>;

  // Fetch a single document by ID
  fetchDoc(id: string, locale: Locale): Iterator<any>;

  // Fetch all documents for locale
  fetchAllDocs(locale: Locale): Iterator<any>;

  // Directly set a document.  Used by preview mode
  setDocument(document: ArticleDocument | StaticPageDocument): void;

}
