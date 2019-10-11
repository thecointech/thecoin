import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as ContentHeightState } from 'components/ContentHeightMeasure/types';
import { ApplicationBaseState } from '@the-coin/components/types';

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends ApplicationBaseState {
  readonly router: RouterState;
  readonly language: ILanguageProviderProps;
  readonly content: ContentHeightState;
  // for testing purposes
  readonly test: any;
}
