import { RouterState } from 'connected-react-router';
import { ContainerState as LanguageProviderState } from './containers/LanguageProvider/reducer';
import { ContentState } from './components/ContentHeightMeasure/types';

// Your root reducer type, which is your redux state types also
export interface SiteBaseStore {
  readonly router: RouterState;
  readonly language: LanguageProviderState;
  readonly content: ContentState;
}
