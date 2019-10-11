import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import injectReducer from '../../utils/injectReducer';
import { SidebarGenerators, IActions, ItemGenerator, ItemModifier } from './types';
import { ApplicationBaseState } from '@the-coin/components/types';

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

const reducer = createReducerFunction(SidebarItemsReducer, initialState);

function buildReducer<T>() {
  return injectReducer<T>({
    key: SIDEBAR_KEY,
    reducer: reducer
  });
}

export { buildReducer, SidebarItemsReducer, initialState }