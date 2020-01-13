import { createActionCreators } from 'immer-reducer';
import { Dispatch, bindActionCreators } from 'redux';
import { SidebarItemsReducer } from './reducer';
import { IActions } from './types';
import { useDispatch } from 'react-redux';

const Actions = createActionCreators(SidebarItemsReducer);

// Map Disptach to your DispatchProps
export type DispatchProps = IActions;
export function SidebarActions(dispatch: Dispatch): IActions {
  return (bindActionCreators(Actions, dispatch) as any) as IActions;
}

export function useSidebar() {
  return SidebarActions(useDispatch());
}
  