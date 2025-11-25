import { ContentState } from './components/ContentHeightMeasure/types';

// Your root reducer type, which is your redux state types also
export interface SiteBaseStore {
  readonly content: ContentState;
}
