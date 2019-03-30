import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import injectReducer from 'utils/injectReducer';
import { ContainerState, SidebarMenuItem, IActions } from './types';

// The initial state of the App
const initialState: ContainerState = {
  items: [
    {
      link: {
        name: "Testing",
        to: "Some Location"
      }
    }
  ],
};

class SidebarItemsReducer extends ImmerReducer<ContainerState>
  implements IActions {
  setItems(newItems: SidebarMenuItem[]) {
    this.draftState.items = newItems;
  }

  setSubItems(parent: string, subItems: SidebarMenuItem[]) {
    //const parentIdx = this.state.items.findIndex(element => element.link.name == parent);
    //if(parentIdx > 0)
    //  this.draftState.items[parentIdx].subItems = subItems;
    // const newItems = this.state.items.map(item => {
    //   if (item.link.name == parent) {
    //     return {
    //       ...item,
    //       subItems: subItems
    //     }
    //   }
    //   return item;
    // })
    this.draftState.subParentName = parent;
    this.draftState.subItems = subItems;
  }
}

const reducer = createReducerFunction(SidebarItemsReducer, initialState);

function buildReducer<T>() {
  return injectReducer<T>({
    key: 'sidebar',
    reducer: reducer
  });
}

export {buildReducer, SidebarItemsReducer, initialState}