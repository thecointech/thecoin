import { Store, Reducer } from 'redux';
import { SidebarGenerators } from '../containers/PageSidebar/types';
import { FxRatesState } from '../containers/FxRate/types';
import { Saga, Task } from 'redux-saga';
import { LanguageProviderState } from '../containers/LanguageProvider/types';

// Your root reducer type, which is your redux state types also
// TODO: Rename to SharedBaseStore (more accurate name)
export interface ApplicationBaseState {
  readonly sidebar: SidebarGenerators;
  readonly fxRates: FxRatesState;
  readonly language: LanguageProviderState;
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
