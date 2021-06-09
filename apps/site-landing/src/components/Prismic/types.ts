import {Document} from 'prismic-javascript/d.ts/documents'

export type RenderableType = {
  type: string;
  text: string;
  spans: string[];
  url?: string
}

export type FAQResult = {
  question: RenderableType[];
  answer: RenderableType[];
  category: string;
  fr_category: string;
  show_on_faq_home?: boolean;
}

export type ImageObj = {
  alt: string
  copyright: string
  dimensions: { width: number, height: number }
  ​​​​​url: string
}

export type ArticleResult = {
  thumbnail: RenderableType[]|null
  image_before_title: RenderableType[]|null,
  title: RenderableType[]|null;
  questions: RenderableType[]|null;
  content: RenderableType[]|null;
  author: RenderableType[]|null;
  categories: [],
  fr_categories: []
}
export type FAQDocument = 
  Omit<Document, "data"> & 
  {
    data: FAQResult
  }

export type ArticleDocument = 
  Omit<Document, "data"> & 
  {
    data: ArticleResult
  }

export const initialState = {
  faqs: [] as FAQDocument[],
  articles: [] as ArticleDocument[],
}
export type PrismicState = typeof initialState;

export interface IActions {
  fetchAllDocs() : Iterator<any>;
}
