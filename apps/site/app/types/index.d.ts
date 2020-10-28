import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ContainerState as LanguageProviderState } from 'components/LanguageProvider/reducer';
import { ContentState } from 'components/ContentHeightMeasure/types';
import { Saga, Task } from 'redux-saga';
import { ApplicationBaseState } from '@the-coin/shared/types';
import { PrismicState } from 'components/Prismic/types';

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends ApplicationBaseState {
  readonly router: RouterState;
  readonly language: LanguageProviderState;
  readonly content: ContentState;
  readonly documents: PrismicState;
  readonly test: any;
}