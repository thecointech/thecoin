import { ImmerReducer } from 'immer-reducer';
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
    for (let i = 0; i < items.length; i++) {
      if (items[i].link == parent.link) {
        items[i].subItems = subItems;
      }
    }
  }
}

export function buildReducer<T>() {
  return injectReducer<T>({
    key: 'sidebar',
    reducer: SidebarItemsReducer,
    initialState,
  });
}
