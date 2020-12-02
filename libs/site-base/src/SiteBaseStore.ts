import { RouterState } from 'connected-react-router';
import { ContainerState as LanguageProviderState } from 'components/LanguageProvider/reducer';
import { ContentState } from 'components/ContentHeightMeasure/types';
import { ApplicationBaseState } from '@the-coin/shared/types';

// Your root reducer type, which is your redux state types also
export interface SiteBaseStore extends ApplicationBaseState {
  readonly router: RouterState;
  readonly language: LanguageProviderState;
  readonly content: ContentState;
}
