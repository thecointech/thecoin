import type { RichTextField, PrismicDocument } from '@prismicio/types';
import type { Locale } from '@thecointech/redux-intl'

export type RenderableType = {
  type: string;
  text: string;
  spans: string[];
  url?: string
}

export type FAQResult = {
  question: RichTextField;
  answer: RichTextField;
  category: string;
  show_on_faq_home?: boolean;
}

export type ImageObj = {
  alt: string
  copyright: string
  dimensions: { width: number, height: number }
  url: string
}

export type AlternateLang = {
  id: string,
  type: string,
  lang: string
}

export type ArticleResult = {
  thumbnail: ImageObj,
  image_before_title: ImageObj,
  title: RichTextField;
  publication_date: string;
  short_content: RichTextField;
  content: RichTextField;
  author: RichTextField;
  categories: { category: string }[],
  id: string
}
export type FAQDocument =
  Omit<PrismicDocument, "data"> &
  {
    data: FAQResult
  }
export type FAQDocuments = Map<string, FAQDocument>;

export type ArticleDocument =
  Omit<PrismicDocument, "data"> &
  {
    data: ArticleResult
  }
export type ArticleDocuments = Map<string, ArticleDocument>;

export type LocaleDocuments = {
  fullyLoaded: boolean,
  faqs: FAQDocuments,
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
