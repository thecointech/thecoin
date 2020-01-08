import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import { injectReducer, useInjectReducer } from "redux-injectors";
import { SidebarGenerators, IActions, ItemGenerator, ItemModifier } from './types';
import { ApplicationBaseState } from '../../types';

const SIDEBAR_KEY : keyof ApplicationBaseState = "sidebar";

// The initial state of the App
const initialState: SidebarGenerators = {
  rootGenerator: null,
  subGenerators: {}
};

class SidebarItemsReducer extends ImmerReducer<SidebarGenerators>
  implements IActions {

  addGenerator(name: string, generator: ItemModifier): void {
    this.draftState.subGenerators[name] = generator;
  }
  removeGenerator(name: string): void {
    delete this.draftState.subGenerators[name];
  }
  setRootGenerator(generator: ItemGenerator): void {
    this.draftState.rootGenerator = generator;
  }
}

const reducer = createReducerFunction(SidebarItemsReducer, initialState) as any;

export const useSidebar = () => {
  useInjectReducer({ key: SIDEBAR_KEY, reducer: reducer });
}

function buildReducer() {
  return injectReducer({
    key: SIDEBAR_KEY,
    reducer: reducer
  });
}

export { buildReducer, SidebarItemsReducer, initialState }