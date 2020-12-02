import {Document} from 'prismic-javascript/d.ts/documents'

export type RenderableType = {
  type: string;
  text: string;
  spans: string[];
}

export type FAQResult = {
  questions: RenderableType[]|null;
  answers: RenderableType[]|null;
  category: string;
  starred?: boolean;
}

export type ArticleResult = {
  title: RenderableType[]|null;
  questions: RenderableType[]|null;
  answers: RenderableType[]|null;
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
  fetchFaqs() : Iterator<void>;
}
