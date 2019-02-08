import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as ContentHeightState } from 'components/ContentHeightMeasure/types';
import { ContainerState as SidebarContentsState } from 'containers/PageSidebar/types';
import { ContainerState as AccountsState } from 'containers/Accounts/types';

import { ImmerReducerClass, ImmerReducerState, ActionCreators } from 'immer-reducer';

// /** flatten functions in an object to their return values */
// declare type FlattenToReturnTypes<T extends {
//   [key: string]: () => any;
// }> = {
//   [K in keyof T]: ReturnType<T[K]>;
// };
// /** get union of object value types */
// declare type ObjectValueTypes<T> = T[keyof T];
// /** get union of object method return types */
// declare type ReturnTypeUnion<T extends {
//   [key: string]: () => any;
// }> = ObjectValueTypes<FlattenToReturnTypes<T>>;

// /** generate reducer function type form the ImmerReducer class */
// interface ImmerReducerFunction<T extends ImmerReducerClass> {
//   (state: ImmerReducerState<T> | undefined, action: ReturnTypeUnion<ActionCreators<T>>): ImmerReducerState<T>;
// }
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
