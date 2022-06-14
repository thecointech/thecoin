import { RouterState } from 'connected-react-router';
import { ContentState } from './components/ContentHeightMeasure/types.js';

// Your root reducer type, which is your redux state types also
export interface SiteBaseStore {
  readonly router: RouterState;
  readonly content: ContentState;
}
