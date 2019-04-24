import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as SidebarContentsState } from 'containers/PageSidebar/types';
import { ContainerState as AccountState } from 'containers/Account/types';

import { ImmerReducerClass, ImmerReducerState, ActionCreators } from 'immer-reducer';
import { Dictionary } from 'lodash';
import { ApplicationRootState as BaseState } from '@the-coin/react-components/src/types'

export interface AnyProps {
  [key: string]: any;
}

export interface LifeStore extends Store<{}> {
  injectedReducers?: any;
  injectedSagas?: any;
  runSaga(saga: () => IterableIterator<any>, args: any): any;
}

export interface InjectReducerParams {
  key: string;
  reducer: any;
}

export interface InjectSagaParams {
  key: string;
  saga: () => IterableIterator<any>;
  mode?: string | undefined;
}

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends BaseState {
  readonly router: RouterState;
  readonly language: ILanguageProviderProps;
  readonly sidebar: SidebarContentsState;

  readonly accounts: Dictionary<AccountState>;
  // for testing purposes
  readonly test: any;
}
