import { BaseReducer } from '@thecointech/redux/immerReducer';
import type { SidebarState, IActions, SidebarGenerator, SidebarHeader } from './types';
import type { ApplicationBaseState } from '../../types';

const SIDEBAR_KEY : keyof ApplicationBaseState = "sidebar";

export const initialState = {
  items: {
    header: null,
    links: [],
  },
  generators: {},
  visible: true,
}
export class SidebarItemsReducer extends BaseReducer<IActions, SidebarState>(SIDEBAR_KEY, initialState)
  implements IActions {
  addGenerator(name: string, generator: SidebarGenerator): void {
    this.draftState.generators[name] = generator;
  }
  removeGenerator(name: string): void {
    delete this.draftState.generators[name];
  }
  setHeader(header: SidebarHeader): void {
    this.draftState.items.header = header;
  }
  setVisible(visible: boolean): void {
    this.draftState.visible = visible;
  }
}
