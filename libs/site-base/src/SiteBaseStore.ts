import { RouterState } from 'connected-react-router';
import { ApplicationBaseState } from '@the-coin/shared/types';
import { ContainerState as LanguageProviderState } from './containers/LanguageProvider/reducer';
import { ContentState } from './components/ContentHeightMeasure/types';

// Your root reducer type, which is your redux state types also
export interface SiteBaseStore extends ApplicationBaseState {
  readonly router: RouterState;
  readonly language: LanguageProviderState;
  readonly content: ContentState;
}
