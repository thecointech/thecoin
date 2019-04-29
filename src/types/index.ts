import { Store } from 'redux';
//import { RouterState } from 'connected-react-router';
//import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as SidebarContentsState } from '../containers/PageSidebar/types';
import { AccountMap } from '../containers/Account/types';
import { ContainerState as FxRateState } from '../containers/FxRate/types';

export interface LifeStore extends Store<{}> {
  injectedReducers?: any;
  injectedSagas?: any;
  runSaga(saga: () => IterableIterator<any>, args: any): any;
  // createReducer function attached to the store
  // to allow it to be injected by the running app.
  createReducer: (injectedReducers: {}) => any;
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
export interface ApplicationBaseState {
  // readonly router: RouterState;
  // readonly language: ILanguageProviderProps;
  readonly sidebar: SidebarContentsState;

  readonly accounts: AccountMap;
  readonly fxRates: FxRateState;
}
