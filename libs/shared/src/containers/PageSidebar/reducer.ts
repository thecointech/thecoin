import { useInjectReducer } from "redux-injectors";
import { SidebarState, IActions, SidebarGenerator } from './types';
import { ApplicationBaseState } from '../../types';
import { TheCoinReducer } from '../../store/immerReducer';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';
import { ActionCreators } from 'immer-reducer';

const SIDEBAR_KEY : keyof ApplicationBaseState = "sidebar";

export const initialState = {
  items: [],
  generators: {}
}
export class SidebarItemsReducer extends TheCoinReducer<SidebarState>
  implements IActions {


  addGenerator(name: string, generator: SidebarGenerator): void {
    this.draftState.generators[name] = generator;
  }
  removeGenerator(name: string): void {
    delete this.draftState.generators[name];
  }

  static reducer: any;
  static actions: ActionCreators<typeof SidebarItemsReducer>;
  static initialize(state: Partial<SidebarState>) {
    const r = SidebarItemsReducer.buildReducers(SidebarItemsReducer, {
      ...initialState,
      ...state
    });
    SidebarItemsReducer.reducer = r.reducer;
    SidebarItemsReducer.actions = r.actions;
  }
}

export const useSidebar = () => useInjectReducer({ key: SIDEBAR_KEY, reducer: SidebarItemsReducer.reducer });
export const useSidebarApi = () => bindActionCreators(SidebarItemsReducer.actions, useDispatch());
