import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as ContentHeightState } from 'components/ContentHeightMeasure/types';
import { ContainerState as SidebarContentsState } from 'containers/PageSidebar/types';
import { ContainerState as AccountsState } from 'containers/Accounts/types';

import { ImmerReducerClass } from 'immer-reducer';

export interface LifeStore extends Store<{}> {
  injectedReducers?: any;
  injectedSagas?: any;
  runSaga(saga: () => IterableIterator<any>, args: any): any;
}

export interface InjectReducerParams {
  key: keyof ApplicationRootState;
  reducer: ImmerReducerClass;
  initialState: object;
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
  readonly content: ContentHeightState;
  readonly sidebar: SidebarContentsState;
  readonly accounts: AccountsState;
  // for testing purposes
  readonly test: any;
}
