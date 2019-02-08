import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import injectReducer from 'utils/injectReducer';
import { ContainerState, SidebarMenuItem, IActions } from './types';

// The initial state of the App
const initialState: ContainerState = {
  items: [],
};

export class SidebarItemsReducer extends ImmerReducer<ContainerState>
  implements IActions {
  setItems(newItems: SidebarMenuItem[]) {
    this.draftState.items = newItems;
  }

  setSubItems(parent: SidebarMenuItem, subItems: SidebarMenuItem[]) {
    const items = this.draftState.items;
    items.find(element => {
      if (element.link.to == parent.link.to) {
        element.subItems = subItems;
        return true;
      }
      return false;
    });
  }
}

const reducer = createReducerFunction(SidebarItemsReducer, initialState);

export function buildReducer<T>() {
  return injectReducer<T>({
    key: 'sidebar',
    reducer: reducer,
    initialState,
  });
}
