import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ContainerState as LanguageProviderState } from 'containers/LanguageProvider/reducer';
import { ContainerState as ContentHeightState } from 'components/ContentHeightMeasure/types';
import { Saga, Task } from 'redux-saga';
import { ApplicationBaseState } from '@the-coin/shared/types';
import { AccountsState } from 'containers/Accounts/types';
import { AccountMap } from '@the-coin/shared/containers/Account/types';

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends ApplicationBaseState {
  readonly activeAccount: AccountsState;
  readonly accounts: AccountMap;
  readonly router: RouterState;
  readonly language: LanguageProviderState;
  readonly content: ContentHeightState;
  // for testing purposes
  readonly test: any;
}