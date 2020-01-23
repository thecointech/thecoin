import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import { injectReducer, useInjectReducer } from "redux-injectors";
import { SidebarGenerators, IActions, SidebarGenerator } from './types';
import { ApplicationBaseState } from '../../types';

const SIDEBAR_KEY : keyof ApplicationBaseState = "sidebar";

// The initial state of the App
export const initialState: SidebarGenerators = {
  generators: {}
};

export class SidebarItemsReducer extends ImmerReducer<SidebarGenerators>
  implements IActions {

  addGenerator(name: string, generator: SidebarGenerator): void {
    this.draftState.generators[name] = generator;
  }
  removeGenerator(name: string): void {
    delete this.draftState.generators[name];
  }
}

const reducer = createReducerFunction(SidebarItemsReducer, initialState) as any;

export const useSidebar = () => {
  useInjectReducer({ key: SIDEBAR_KEY, reducer: reducer });
}

export function buildReducer() {
  return injectReducer({
    key: SIDEBAR_KEY,
    reducer: reducer
  });
}
