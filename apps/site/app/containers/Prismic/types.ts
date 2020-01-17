import {Document} from 'prismic-javascript/d.ts/documents'

export const initialState = {
  faqs: [] as Document[]
}
export type PrismicState = typeof initialState;

export interface IActions {
  fetchFaqs() : Iterator<any>;
}
