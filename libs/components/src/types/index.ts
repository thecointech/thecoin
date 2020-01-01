import { Store, Reducer } from 'redux';
//import { RouterState } from 'connected-react-router';
//import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { SidebarGenerators } from '../containers/PageSidebar/types';
import { AccountMap } from '../containers/Account/types';
import { ContainerState as FxRateState } from '../containers/FxRate/types';
import { Saga, Task } from 'redux-saga';

// Your root reducer type, which is your redux state types also
export interface ApplicationBaseState {
  readonly sidebar: SidebarGenerators;
  readonly accounts: AccountMap;
  readonly fxRates: FxRateState;
}

export interface InjectedStore extends Store<{}> {
  injectedReducers: any;
  injectedSagas: any;
  runSaga<S extends Saga>(saga: S, ...args: Parameters<S>): Task;
  // createReducer function attached to the store
  // gives the calling app control over the always-on
  // reducers (ie - the ones that aren't injected)
  createReducer: (injectedReducers: {}) => Reducer<any>;
}

export interface InjectReducerParams {
  // Our key is set to a string because we (as a library)
  // do not know what reducers will be added by the app
  key: string;
  reducer: Reducer<any, any>;
}

export interface InjectSagaParams<S extends Saga> {
  key: string;
  saga: S;
  mode?: string | undefined;
}
