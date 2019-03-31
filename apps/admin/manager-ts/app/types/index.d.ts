import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as SidebarContentsState } from 'containers/PageSidebar/types';
import { ContainerState as AccountState } from 'containers/Account/types';
import { ContainerState as FxRateState } from 'containers/FxRate/types';

import { ImmerReducerClass, ImmerReducerState, ActionCreators } from 'immer-reducer';

export interface AnyProps {
  [key: string]: any;
}

export interface LifeStore extends Store<{}> {
  injectedReducers?: any;
  injectedSagas?: any;
  runSaga(saga: () => IterableIterator<any>, args: any): any;
}

export interface InjectReducerParams {
  key: keyof ApplicationRootState;
  reducer: any;
}

export interface InjectSagaParams {
  key: keyof ApplicationRootState;
  saga: () => IterableIterator<any>;
  mode?: string | undefined;
}

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState {
  readonly router: RouterState;
  readonly language: ILanguageProviderProps;
  readonly sidebar: SidebarContentsState;

  readonly coinAccount: AccountState;
  readonly brokerCadAccount: AccountState;
  readonly fxRates: FxRateState;
  // for testing purposes
  readonly test: any;
}
