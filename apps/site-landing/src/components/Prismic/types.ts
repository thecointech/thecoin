// import type { RichTextField, PrismicDocument } from '@prismicio/types';
import type { Locale } from '@thecointech/redux-intl'
import type { ArticleDocument, FaqDocument } from '@thecointech/site-prismic/types';

export type FaqDocuments = Map<string, FaqDocument>;

export type ArticleDocuments = Map<string, ArticleDocument>;

export type LocaleDocuments = {
  fullyLoaded: boolean,
  faqs: FaqDocuments,
  articles: ArticleDocuments,
}
export type PrismicState = {
  [locale in Locale]: LocaleDocuments;
}

export interface IActions {
  // Fetch a single document by ID
  fetchDoc(id: string, locale: Locale): Iterator<any>;

  // Fetch all documents for locale
  fetchAllDocs(locale: Locale): Iterator<any>;
}
