import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';

import { ApplicationBaseState } from '@thecointech/shared/types'


// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends ApplicationBaseState {
  readonly router: RouterState;
  readonly language: ILanguageProviderProps;
  // for testing purposes
  readonly test: any;
}
