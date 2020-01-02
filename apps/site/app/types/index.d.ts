import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ContainerState as LanguageProviderState } from 'containers/LanguageProvider/reducer';
import { ContainerState as ContentHeightState } from 'components/ContentHeightMeasure/types';
import { Saga, Task } from 'redux-saga';
import { ApplicationBaseState } from '@the-coin/shared/lib/types';
import { AccountsState } from 'containers/Accounts/types';

// export interface InjectedStore extends Store {
//   injectedReducers: any;
//   injectedSagas: any;
//   runSaga<S extends Saga>(saga: S, ...args: Parameters<S>): Task;
// }

// export interface InjectReducerParams {
//   key: keyof ApplicationRootState;
//   reducer: Reducer<any, any>;
// }

// export interface InjectSagaParams<S extends Saga> {
//   key: keyof ApplicationRootState;
//   saga: S;
//   mode?: string | undefined;
// }

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends ApplicationBaseState {
  readonly activeAccount: AccountsState;
  readonly router: RouterState;
  readonly language: LanguageProviderState;
  readonly content: ContentHeightState;
  // for testing purposes
  readonly test: any;
}