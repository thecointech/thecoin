import {Document} from 'prismic-javascript/d.ts/documents'

export type RenderableType = {
  type: string;
  text: string;
  spans: string[];
}

export type FAQResult = {
  marketddown: RenderableType[]|null;
  answer: RenderableType[]|null;
}

export type ArticleResult = {
  title: RenderableType[]|null;
  content: RenderableType[]|null;
  author: RenderableType[]|null;
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
  fetchFaqs() : Iterator<any>;
}
