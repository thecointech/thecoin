import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as SidebarContentsState } from 'containers/PageSidebar/types';

import { ImmerReducerClass, ImmerReducerState, ActionCreators } from 'immer-reducer';
import { Dictionary } from 'lodash';
import { ApplicationRootState as BaseState } from '@the-coin/components/lib/types'


// Your root reducer type, which is your redux state types also
export interface ApplicationRootState extends BaseState {
  readonly router: RouterState;
  readonly language: ILanguageProviderProps;
  // for testing purposes
  readonly test: any;
}
